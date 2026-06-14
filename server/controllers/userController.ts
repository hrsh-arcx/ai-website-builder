import {Request, Response} from "express";
import {StatusCodes} from 'http-status-codes'
import prisma from "../lib/prisma.js";
import openai from "../config/openai.js";


//Get User Credits
export const getUserCredits = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if(!userId){
            return res
                    .status(StatusCodes.UNAUTHORIZED)
                    .json({message: 'Unauthorized user'})
        }

        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        
        res.json({credits: user?.credits})
    } catch (error:any) {
        return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json({message: error.message})
    }
}


// Create a new Project
export const createUserProject = async (req: Request, res: Response) => {
    const userId = req.userId;
    try {
        if(!userId){
            return res
                    .status(StatusCodes.UNAUTHORIZED)
                    .json({message: 'Unauthorized user'})
        }

        const {initial_prompt} = req.body;

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

        if(user.credits <5){
            return res
                    .status(StatusCodes.FORBIDDEN)
                    .json({message: 'Not enough credits'})
        }

        const project = await prisma.websiteProject.create({
            data : {
                name: initial_prompt.length>30 ? initial_prompt.substring(0, 30)+'...' : initial_prompt,
                initial_prompt: initial_prompt,
                userId: userId,
            }
        })

        await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                credits: {decrement: 5},
                totalCreation : {increment: 1}
            }
        })

        await prisma.conversation.create({
            data: {
                role : 'user',
                projectId: project.id,
                content: initial_prompt
            }
        })

        res.json({projectId: project.id})

        //Enhance User Prompt
        const promptEnhanceResponse = await openai.chat.completions.create({
            model: 'google/gemma-4-31b-it:free',
            messages: [
                {
                    role : 'system',
                    content : `You are a prompt enhancement specialist. Take the user's website request and expand it into a detailed, comprehensive prompt that will help create the best possible website.

                                Enhance this prompt by:
                                1. Adding specific design details (layout, color scheme, typography)
                                2. Specifying key sections and features
                                3. Describing the user experience and interactions
                                4. Including modern web design best practices
                                5. Mentioning responsive design requirements
                                6. Adding any missing but important elements

                            Return ONLY the enhanced prompt, nothing else. Make it detailed but concise (2-3 paragraphs max).`
                },
                {
                    role : 'user',
                    content : initial_prompt
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
                content: `now generating your website...`
            }
        })

        //generate website code
        const websiteCodeResponse = await openai.chat.completions.create({
            model: 'google/gemma-4-31b-it:free',
            messages: [
                {
                    role : 'system',
                    content : `You are an expert web developer. Create a complete, production-ready, single-page website based on this request: "${enhancedPrompt}"

                                CRITICAL REQUIREMENTS:
                                - You MUST output valid HTML ONLY. 
                                - Use Tailwind CSS for ALL styling
                                - Include this EXACT script in the <head>: <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
                                - Use Tailwind utility classes extensively for styling, animations, and responsiveness
                                - Make it fully functional and interactive with JavaScript in <script> tag before closing </body>
                                - Use modern, beautiful design with great UX using Tailwind classes
                                - Make it responsive using Tailwind responsive classes (sm:, md:, lg:, xl:)
                                - Use Tailwind animations and transitions (animate-*, transition-*)
                                - Include all necessary meta tags
                                - Use Google Fonts CDN if needed for custom fonts
                                - Use placeholder images from https://placehold.co/600x400
                                - Use Tailwind gradient classes for beautiful backgrounds
                                - Make sure all buttons, cards, and components use Tailwind styling

                                CRITICAL HARD RULES:
                                1. You MUST put ALL output ONLY into message.content.
                                2. You MUST NOT place anything in "reasoning", "analysis", "reasoning_details", or any hidden fields.
                                3. You MUST NOT include internal thoughts, explanations, analysis, comments, or markdown.
                                4. Do NOT include markdown, explanations, notes, or code fences.

                                The HTML should be complete and ready to render as-is with Tailwind CSS.`
                },{
                    role : 'user',
                    content : enhancedPrompt || ''
                }
            ]
        })

        const code = websiteCodeResponse.choices[0].message.content || '';
        if(!code){
            await prisma.conversation.create({
                data: {
                    role : 'assistant',
                    projectId: project.id,
                    content: "I couldn't generate a website based on your prompt. Please try again."
                }
            })
            await prisma.user.update({
                where: { id: userId },
                data: { credits: { increment: 5 } }
            })
            return;
        }


        await prisma.conversation.create({
            data: {
                role : 'assistant',
                projectId: project.id,
                content: "I've created your website! You can now preview it and request any changes."
            }
        })

        const version = await prisma.version.create({
            data: {
                code: code?.replace(/```[a-z]*?\n?/gi, '')
                .replace(/```$/g, '')
                .trim(),
                description: 'Initial Version',
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

//Fetch a single unique project
export const getUserProject = async (req: Request, res: Response) => {
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
                conversation : {
                    orderBy : {
                        timestamp : 'asc'
                    }
                },
                versions : {
                    orderBy : {
                        timestamp : 'asc'
                    }
                }
            }
        })

        if(!project){
            return res
                    .status(StatusCodes.NOT_FOUND)
                    .json({message: 'Project not found'})
        }
        res.json(project)
    } catch (error:any) {
        return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json({message: error.message})
    }
}

//Fetch all projects of a user
export const getUserProjects = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if(!userId){
            return res
                    .status(StatusCodes.UNAUTHORIZED)
                    .json({message: 'Unauthorized user'})
        }

        const projects = await prisma.websiteProject.findMany({
            where: { userId },
            orderBy : {
                updatedAt : 'desc'
            }
        })

        if(!projects){
            return res
                    .status(StatusCodes.NOT_FOUND)
                    .json({message: 'Project not found'})
        }
        res.json(projects)

    } catch (error:any) {
        return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json({message: error.message})
    }
}

//Toggle Publish
export const togglePublish = async (req: Request, res: Response) => {
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
        await prisma.websiteProject.update({
            where: {
                id: projectId as string,
                userId
            },
            data : {
                isPublished : !project?.isPublished
            }
        })

        res.json({message: project.isPublished ? 'Project Unpublished' : 'Project Published successfully'})
    } catch (error:any) {
        return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json({message: error.message})
    }
}

export const purchaseCredits = async (req: Request, res: Response) => {}