const nodemailer = require("nodemailer");
const templateManager = require('./template');

let activeTransporter = null;

const getTransporter = () => (
    activeTransporter ||
    (activeTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: !!parseInt(process.env.SMTP_SECURE),
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        }
    }))
);

exports.renderMail = (options, data) => {
    options.from = options.from || process.env.SMTP_FROM;
    if (options.templates){
        const templates = options.templates;
        if (templates.subject) {
            options.subject = templateManager.render(templates.subject, data);
        }
        if (templates.text) {
            options.text = templateManager.render(templates.text, data);
        }
        if (templates.html) {
            options.html = templateManager.render(templates.html, data);
        }
        delete options.templates;

    }
    const transporter = getTransporter();
    return transporter.sendMail(options)
        .then(status => {
            transporter.close();
            console.log(`Mailer.SendMail.success`, options.to, options.subject);
            return Promise.resolve(status)
        })
        .catch(error => {
            transporter.close();
            console.log(`Mailer.SendMail.error`, options.to, options.subject, error);
            return Promise.reject(error)
        })
};