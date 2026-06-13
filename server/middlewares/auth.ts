import {Request, Response, NextFunction} from "express";
import { auth } from "../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";
import {StatusCodes} from 'http-status-codes'

console.log('f')
export const protect = async (req: Request, res: Response, next: NextFunction) => {
    console.log("Protect middleware hit for:", req.url); 
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers)
        })

        if(!session || !session?.user){
            return res
                    .status(StatusCodes.UNAUTHORIZED)
                    .json({message: 'Unauthorized user'})
        }

        req.userId = session.user.id
        next();
    } catch (error:any) {
        console.log(error)
        return res
                .status(StatusCodes.UNAUTHORIZED)
                .json({message: error.message})
    }
}