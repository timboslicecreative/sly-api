exports.COOKIE_CONFIG = {
    maxAge: process.env.COOKIE_EXPIRY,
    httpOnly: !!parseInt(process.env.COOKIE_HTTP_ONLY),
    secure: !!parseInt(process.env.COOKIE_SECURE),
    signed: !!parseInt(process.env.COOKIE_SIGNED)
};

exports.PATTERNS = {
    email: '/^\\w+([\\.-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,3})+$/'
};


exports.logo = "" +
    "                                              \n" +
    "███████╗██╗  ██╗   ██╗      █████╗ ██████╗ ██╗\n" +
    "██╔════╝██║  ╚██╗ ██╔╝     ██╔══██╗██╔══██╗██║\n" +
    "███████╗██║   ╚████╔╝█████╗███████║██████╔╝██║\n" +
    "╚════██║██║    ╚██╔╝ ╚════╝██╔══██║██╔═══╝ ██║\n" +
    "███████║███████╗██║        ██║  ██║██║     ██║\n" +
    "╚══════╝╚══════╝╚═╝        ╚═╝  ╚═╝╚═╝     ╚═╝";