import { StatusCodes } from "http-status-codes";
import { Express } from "express";
import { generateToken, authRequired, AuthTokenPayload } from "auth";
import { User } from "model/User";
import { AppDataSource } from "data-source";
import bcrypt from "bcryptjs";

export function AuthEndpoints(app: Express) {
    const userRepository = AppDataSource.getRepository(User);

    app.post("/login", async (req, res) => {
        try {
            if(!req.body){
                return res.status(StatusCodes.BAD_REQUEST).send({
                    message: 'Missing request body'
                });
            }

            const { login, password } = req.body;

            if(!login || !password) {
                return res.status(StatusCodes.BAD_REQUEST).send({ 
                    message: "Username and password are required."
                });
                }

            const user = await userRepository.findOne({ 
                where: { login },
            });

            if (!user) {
                return res.status(StatusCodes.UNAUTHORIZED).send({ 
                    message: "Invalid username or password." 
                });
            }

            const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

            if (!isPasswordValid) {
                return res.status(StatusCodes.UNAUTHORIZED).send({ 
                    message: "Invalid username or password." 
                });
            }

            const token = generateToken({
                userId: user.id,
                login: user.login,
                role: user.role,
            });

            return res.status(StatusCodes.OK).send({ token });

        } catch (err) {
            console.error(err);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
                error: 'Failed to authenticate'
            });
        }
    });

    app.post("refresh-token", authRequired, async (req, res) => {
        try {
            if(!req.body){
                return res.status(StatusCodes.BAD_REQUEST).send({
                    message: 'Missing request body'
                });
            }

            const user = (req as any) as AuthTokenPayload;

            const newToken = generateToken({
                userId: user.userId,
                login: user.login,
                role: user.role,
            });

            return res.status(StatusCodes.OK).send({ token: newToken });

        } catch (err) {
            console.error(err);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
                error: 'Failed to refresh auth token'
            });
        }
    });
}