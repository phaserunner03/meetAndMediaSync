export function newUserAccessRequestTemplate(userInfo: { name: string; email: string }) {
    return {
        subject: "New User Access Request",
        text: `A new user with email ${userInfo.email} has requested access.`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2 style="color: #333;">New User Access Request</h2>
                <p>A new user has requested access to the system. Here are the details:</p>
                <ul>
                    <li><strong>Name:</strong> ${userInfo.name}</li>
                    <li><strong>Email:</strong> ${userInfo.email}</li>
                </ul>
                <p>Please review and take the necessary action.</p>
                <p>Thank you,</p>
                <p><em>Your Team</em></p>
            </div>
        `,
    };
}
