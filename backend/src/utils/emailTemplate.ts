import { MailSubjects, MailTexts, MailHtml } from "../constants/mails.constants";

export function newUserAccessRequestTemplate(userInfo: { name: string; email: string }) {
    return {
        subject: MailSubjects.SUBJECT_NEW_USER,
        text: MailTexts.SUBJECT_NEW_USER(userInfo),
        html: MailHtml.SUBJECT_NEW_USER(userInfo),
    };
}

export function welcomeUserTemplate(userInfo: { email: string }, loginUrl: string) {
    return {
        subject: MailSubjects.SUBJECT_WELCOME_USER,
        text: MailTexts.SUBJECT_WELCOME_USER(userInfo,loginUrl),
        html: MailHtml.SUBJECT_WELCOME_USER(userInfo,loginUrl),
    };
}
