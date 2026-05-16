import {getAuth} from "@clerk/express";

const authenticate = (req, res, next) => {
    try {
        const {userId} = getAuth(req);

        if (!userId) {
            return res.status(401).send({message: "Unauthorized"});
        }

        req.userId = userId;
        next();
    } catch (error) {
        return res.status(500).send({message: "Internal Server Error", error: error.message});
    }
};

export default authenticate;
