import {SignUp} from "@clerk/react";

export default function SignUpPage() {
  return (
    <div className="flex justify-center pt-20 mt-20">
      <SignUp routing="path" path="/sign-up" />
    </div>
  );
}
