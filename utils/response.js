export const sendErrorResponse = (res, statusCode, message, error = null) => {
    return res.status(statusCode).send({ status: false, message, error });
};