export const MailSubjects={
    SUBJECT_NEW_USER:"New User Access Request",
    SUBJECT_WELCOME_USER:"Welcome to CloudCapture!",
}

export const MailTexts={
    SUBJECT_NEW_USER:(userInfo: { name: string; email: string })=>`A new user with email ${userInfo.email} has requested access.`,
    SUBJECT_WELCOME_USER:(userInfo: { email: string }, loginUrl: string)=>`Hello,\n\nYour access has been approved! You can now log in using your email: ${userInfo.email}.\n\nClick here to login: ${loginUrl}\n\nThank you,\nThe Team`,
}

export const MailHtml={
    SUBJECT_NEW_USER:(userInfo: { name: string; email: string })=>`
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
    SUBJECT_WELCOME_USER:(userInfo: { email: string }, loginUrl: string)=>`
            <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
                <h2 style="color: #333; text-align: center;">🎉 Welcome to CloudCapture!</h2>
                <p>Your access has been <strong>approved</strong>. You can now log in and start using our platform.</p>
                <p><strong>Email:</strong> ${userInfo.email}</p>
                <div style="text-align: center; margin: 20px 0;">
                    <a href="${loginUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; font-size: 16px; border-radius: 5px;">Login Now</a>
                </div>
                <p>If you have any questions, feel free to contact us.</p>
                <p>Best regards,</p>
                <p><em>The CloudCapture Team</em></p>
            </div>
        `,
}


