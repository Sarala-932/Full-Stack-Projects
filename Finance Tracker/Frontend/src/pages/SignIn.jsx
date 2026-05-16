import {SignIn} from "@clerk/react";

export default function SignInPage() {
    return (
        <div className="flex justify-center pt-30">
            <SignIn routing="path" path="/sign-in"/>
        </div>
    );
}
