import { Express } from "express";
import { AppDataSource } from "data-source";
import { StatusCodes } from "http-status-codes";
import { Order } from "model/Order";
import { Opinion } from "model/Opinion";
import { authRequired, AuthTokenPayload } from "auth";


export default function addOpinion(app: Express){

    const orderRepo = AppDataSource.getRepository(Order);
    const opinionRepo = AppDataSource.getRepository(Opinion);
    
    app.post('/orders/:id/opinions', authRequired, async (req, res) => {
        try {
            if(!req.body){
                return res.status(StatusCodes.BAD_REQUEST).send({
                    message: 'Missing request body'
                });
            }

            const orderId = parseInt(req.params.id!);
            if (!Number.isInteger(orderId) || orderId < 1) {
                return res.status(StatusCodes.BAD_REQUEST).send({
                    message: 'Invalid order ID. It has to be an integer greater than 0'
                });
            }
            const user = (req as any).user as AuthTokenPayload;
            const order = await orderRepo.findOne({
                where: { id: orderId }, 
                relations: ['orderStatus']
            });
            
            if (!order) {
                return res.status(StatusCodes.NOT_FOUND).send({
                    message: `Order with ID ${orderId} not found`
                });
            }

            if (order.username !== user.login) {
                return res.status(StatusCodes.FORBIDDEN).send({
                    message: `You can add opinion only to your own orders`
                });
            }
            
            if(![2,4].includes(order.orderStatus.id)){
                return res.status(StatusCodes.CONFLICT).send({
                    message: `Cannot add an opinion to an order with status ${order.orderStatus.name}`
                });
            }

            const existingOpinion = await opinionRepo.findOne({
                where: { order: { id: orderId } }
            });
            if (existingOpinion) {
                return res.status(StatusCodes.CONFLICT).send({
                    message: `Opinion for order ${orderId} already exists`,
                    opinion: existingOpinion
                });
            }

            const { rating, content } = req.body;

            if (!content || rating === undefined) {
                return res.status(StatusCodes.BAD_REQUEST).send({
                    message: 'Missing required fields: content, rating'
                });
            }

            if (typeof content !== 'string') {
                return res.status(StatusCodes.BAD_REQUEST).send({
                    message: 'opinion content must be a string'
                });
            }

            if (content.length === 0) {
                return res.status(StatusCodes.BAD_REQUEST).send({
                    message: 'content cannot be an empty string'
                });
            }

            const parsedRating = Number(rating);

            if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
                return res.status(StatusCodes.BAD_REQUEST).send({
                    message: 'rating must be an integer between 1 and 5'
                });
            }
           
            const opinion = new Opinion();
            opinion.rating = parsedRating;
            opinion.content = content;
            opinion.order = order;
            
            const savedOpinion = await opinionRepo.save(opinion);

            return res.status(StatusCodes.CREATED).send({
                opinion: savedOpinion,
            });
        } catch (err) {
            console.error(err);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
                error: 'Failed to add opinion'
            });
        }
    })
}