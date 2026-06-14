import {getAuth, clerkClient} from "@clerk/express";
import userModel from "../models/userModel.mjs";

const registerUser = async (req, res) => {
    try {
        const {userId} = getAuth(req);

        if (!userId) {
            return res.status(401).send({message: "Unauthorized User"});
        }
        const clerkUser = await clerkClient.users.getUser(userId);
        // console.log("All emails:", clerkUser.emailAddresses);
        // console.log("Primary email:", clerkUser.primaryEmailAddressId);
        // console.log("Email 0:", clerkUser.emailAddresses[0].emailAddress);
        const firstName = clerkUser.firstName || "";
        const lastName = clerkUser.lastName || "";
        const name = `${firstName} ${lastName}`.trim() || null;

        const isUserAlreadyExist = await userModel.findOne({clerkUserId: userId});

        if (isUserAlreadyExist) {
            const updatedUser = await userModel.findOneAndUpdate(
                {clerkUserId: userId},
                {
                    name: name || isUserAlreadyExist.name,
                    imageUrl: clerkUser.imageUrl || isUserAlreadyExist.imageUrl,
                    email: clerkUser.emailAddresses[0].emailAddress,
                },
                {new: true},
            );
            return res.status(200).send({
                message: "Login Successful",
                user: {
                    name: updatedUser.name,
                    email: updatedUser.email,
                    imageUrl: updatedUser.imageUrl,
                },
            });
        }

        const newUser = await userModel.create({
            clerkUserId: userId,
            name: name || "",
            imageUrl: clerkUser.imageUrl || "",
            email: clerkUser.emailAddresses[0].emailAddress,
        });

        return res.status(201).send({
            message: "User registered successfully",
            user: {
                name: newUser.name,
                email: newUser.email,
                imageUrl: newUser.imageUrl,
            },
        });
    } catch (error) {
        return res.status(400).send({message: "failed to register user", error: error.message});
    }
};

export default registerUser;
