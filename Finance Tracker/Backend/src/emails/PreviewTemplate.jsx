import React from "react";
import {emailTemplate} from "../lib/emailTemplate.js";

export default function PreviewTemplate() {
    const htmlStr = emailTemplate({
        userName: "",
        type: "budget-alert",
        data: {},
    });

    return <div dangerouslySetInnerHTML={{__html: htmlStr}} />;
}
