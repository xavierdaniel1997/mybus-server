import express, {Request, Response} from 'express';

const addLocationController = async (req: Request, res: Response) => {
    try{
        console.log("from the addlocation controller", req.body)
        res.status(200).json({message: "New location is added successfully"})
    }catch(error: any){
        res.status(401).json({message: "Failed to add new location", error: error.message})
    }
}


export {addLocationController}