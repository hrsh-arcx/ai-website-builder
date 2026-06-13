import {Request, Response} from "express";
import {StatusCodes} from 'http-status-codes'
import prisma from "../lib/prisma.js";
import openai from "../config/openai.js";



//Controller Function to make a revision
export const makeRevision = async (req: Request, res: Response) => {
    const userId = req.userId;
    try {
        if(!userId){
            return res
                    .status(StatusCodes.UNAUTHORIZED)
                    .json({message: 'Unauthorized user'})
        }

        const {projectId} = req.params;
        const {requestedChange} = req.body;

        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })

        if(!user){
            return res
                    .status(StatusCodes.NOT_FOUND)
                    .json({message: 'User not found'})
        }

        if(!projectId || !requestedChange){
            const {initial_prompt} = req.body;
            if(!initial_prompt){
                return res
                        .status(StatusCodes.BAD_REQUEST)
                        .json({message: 'Invalid project details or prompt not provided'})
            }
        }
        if(user.credits <5){
            return res
                    .status(StatusCodes.FORBIDDEN)
                    .json({message: 'Not enough credits'})
        }

        const project = await prisma.websiteProject.findUnique({
            where: {
                id: projectId as string,
                userId
            }
        })

        if(!project){
            return res
                    .status(StatusCodes.NOT_FOUND)
                    .json({message: 'Project not found'})
        }

        await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                credits: {decrement: 5}
            }
        })

        await prisma.conversation.create({
            data: {
                role : 'user',
                projectId: project.id,
                content: requestedChange
            }
        })

        //Enhance User Prompt
        const promptEnhanceResponse = await openai.chat.completions.create({
            model: 'google/gemma-4-31b-it:free',
            messages: [
                {
                    role : 'system',
                    content : `You are a prompt enhancement specialist. The user wants to make changes to their website. Enhance their request to be more specific and actionable for a web developer.

                                    Enhance this by:
                                    1. Being specific about what elements to change
                                    2. Mentioning design details (colors, spacing, sizes)
                                    3. Clarifying the desired outcome
                                    4. Using clear technical terms

                                Return ONLY the enhanced request, nothing else. Keep it concise (1-2 sentences).`
                },
                {
                    role : 'user',
                    content : `Requested changes to website: ${requestedChange}`
                }
            ]
        })

        const enhancedPrompt = promptEnhanceResponse.choices[0].message.content;
        await prisma.conversation.create({
            data: {
                role : 'assistant',
                projectId: project.id,
                content: `I have enhanced your prompt to: ${enhancedPrompt}`
            }
        })
        await prisma.conversation.create({
            data: {
                role : 'assistant',
                projectId: project.id,
                content: `now making changes to your website...`
            }
        })

        //generate website code
        const websiteCodeResponse = await openai.chat.completions.create({
            model: 'google/gemma-4-31b-it:free',
            messages: [
                {
                    role : 'system',
                    content : `You are an expert web developer. 

                                CRITICAL REQUIREMENTS:
                                - Return ONLY the complete updated HTML code with the requested changes.
                                - Use Tailwind CSS for ALL styling (NO custom CSS).
                                - Use Tailwind utility classes for all styling changes.
                                - Include all JavaScript in <script> tags before closing </body>
                                - Make sure it's a complete, standalone HTML document with Tailwind CSS
                                - Return the HTML Code Only, nothing else

                                Apply the requested changes while maintaining the Tailwind CSS styling approach.`
                },{
                    role : 'user',
                    content : `Here is the current Website Code: ${project.current_code}. 
                               The user wants to make the following changes: ${enhancedPrompt}`
                }
            ]
        })

        const code = websiteCodeResponse.choices[0].message.content || '';
        await prisma.conversation.create({
            data: {
                role : 'assistant',
                projectId: project.id,
                content: "I've made changes to your website! You can now preview it and request any changes."
            }
        })

        const version = await prisma.version.create({
            data: {
                code: code?.replace(/```[a-z]*?\n?/gi, '')
                .replace(/```$/g, '')
                .trim(),
                description: 'changes made',
                projectId: project.id
            }
        })

        await prisma.websiteProject.update({
            where: {
                id: project.id
            },
            data: {
                current_code: code?.replace(/```[a-z]*?\n?/gi, '')
                .replace(/```$/g, '')
                .trim(),
                current_version_index: version.id
            }
        })

        res.json({message: 'Changes made successfully'})

    } catch (error:any) {
        if(userId){
                await prisma.user.update({
                where: { id: userId },
                data: { credits: { increment: 5 } }
            })
        }
        return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json({message: error.message})
    }
}


//Controller Function to rollback to a specific version
export const rollbackVersion = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if(!userId){
            return res
                    .status(StatusCodes.UNAUTHORIZED)
                    .json({message: 'Unauthorized user'})
        }

        const {projectId, versionId} = req.params;
        if(!projectId || !versionId){
            return res
                    .status(StatusCodes.BAD_REQUEST)
                    .json({message: 'Project ID and Version ID are required'})
        }

        const project = await prisma.websiteProject.findUnique({
            where: {
                id: projectId as string,
                userId
            }
        })
        if(!project){
            return res
                    .status(StatusCodes.NOT_FOUND)
                    .json({message: 'Project not found'})
        }

        const version = await prisma.version.findUnique({
            where: {
                id: versionId as string,
                projectId: projectId as string
            }
        })

        if(!version){
            return res
                    .status(StatusCodes.NOT_FOUND)
                    .json({message: 'Version not found'})
        }

        await prisma.websiteProject.update({
            where: {
                id: projectId as string,
                userId
            },
            data: {
                current_code: version.code,
                current_version_index: version.id
            }
        })

        await prisma.conversation.create({
            data: {
                role : 'assistant',
                projectId: projectId as string,
                content: `I have rolled back to selected version. Preview!`
            }
        })
        res.json({message: 'Version rolled back successfully'})
    } catch (error:any) {
        return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)  
                .json({message: error.message})
    }
}

//Delete a project
export const deleteProject = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if(!userId){
            return res
                    .status(StatusCodes.UNAUTHORIZED)
                    .json({message: 'Unauthorized user'})
        }

        const {projectId} = req.params;
        if(!projectId){
            return res
                    .status(StatusCodes.BAD_REQUEST)
                    .json({message: 'Project ID is required'})
        }

        const project = await prisma.websiteProject.findUnique({
            where: {
                id: projectId as string,
                userId
            }
        })
        if(!project){
            return res
                    .status(StatusCodes.NOT_FOUND)
                    .json({message: 'Project not found'})
        }

        await prisma.websiteProject.delete({
            where: {
                id: projectId as string,
                userId
            }
        })

        await prisma.version.deleteMany({
            where: {
                projectId: projectId as string
            }
        })

        await prisma.conversation.deleteMany({
            where: {
                projectId: projectId as string
            }
        })

        res.json({message: 'Project deleted successfully'})
    } catch (error:any) {
        return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json({message: error.message})
    }
}


//Controller to get code for project preview
export const getProjectCode = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if(!userId){
            return res
                    .status(StatusCodes.UNAUTHORIZED)
                    .json({message: 'Unauthorized user'})
        }

        const {projectId} = req.params;
        if(!projectId){
            return res
                    .status(StatusCodes.BAD_REQUEST)
                    .json({message: 'Project ID is required'})
        }

        const project = await prisma.websiteProject.findUnique({
            where: {
                id: projectId as string,
                userId
            },
            include : {
                versions : true
            }
        })
        if(!project){
            return res
                    .status(StatusCodes.NOT_FOUND)
                    .json({message: 'Project not found'})
        }

        res.json({project})
    }
    catch(error:any) {
        return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json({message: error.message})
    }
}

//Get Published Projects
export const getPublishedProjects = async (req: Request, res: Response) => {
    try {
        const projects = await prisma.websiteProject.findMany({
            where: {
                isPublished : true
            },
            include : {
                user : true
            }
        })

        res.json({projects})
    } catch (error:any) {
        return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json({message: error.message})
    }
}

//Get a single published project by id
export const getPublishedProject = async (req: Request, res: Response) => {
    try {
        const {projectId} = req.params;
        if(!projectId){
            return res
                    .status(StatusCodes.BAD_REQUEST)
                    .json({message: 'Project ID is required'})
        }

        const project = await prisma.websiteProject.findFirst({
            where: {
                id: projectId as string
            }
        })
        if(!project || !project.isPublished || !project.current_code){
            return res
                    .status(StatusCodes.NOT_FOUND)
                    .json({message: 'Project not found'})
        }
        return res.json({code : project.current_code})
    } catch (error:any) {
        return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json({message: error.message})
    }
}

//save project
export const saveProjectCode = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const {projectId} = req.params;
        const {code} = req.body;

        if(!userId){
            return res
                    .status(StatusCodes.UNAUTHORIZED)
                    .json({message: 'Unauthorized user'})
        }
        if(!projectId){
            return res
                    .status(StatusCodes.BAD_REQUEST)
                    .json({message: 'Project ID is required'})
        }
        if(!code){
            return res
                    .status(StatusCodes.BAD_REQUEST)
                    .json({message: 'Code is required'})
        }

        const project = await prisma.websiteProject.findUnique({
            where: {
                id: projectId as string,
                userId
            }
        })
        if(!project){
            return res
                    .status(StatusCodes.NOT_FOUND)
                    .json({message: 'Project not found'})
        }

        await prisma.websiteProject.update({
            where: {
                id: projectId as string,
                userId
            },            
            data: {
                current_code: code
            }
        })

        res.json({message : 'Project saved successfully'})
    } catch (error:any) {
        return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)  
                .json({message: error.message})
    }
}