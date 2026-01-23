import { Express } from "express";
import { AppDataSource } from "data-source";
import { StatusCodes } from "http-status-codes";
import { Order } from "model/Order";
import { Opinion } from "model/Opinion";


export default function addOpinion(app: Express){

    const orderRepo = AppDataSource.getRepository(Order);
    const opinionRepo = AppDataSource.getRepository(Opinion);
    
    app.post('/orders/:id/opinions', async (req, res) => {
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
            
            const order = await orderRepo.findOne({
                where: { id: orderId }, 
                relations: ['orderStatus']
            });
            
            if (!order) {
                return res.status(StatusCodes.NOT_FOUND).send({
                    message: `Order with ID ${orderId} not found`
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

            const { rating, content, opinion_date } = req.body;
            if (!content || rating === undefined || opinion_date === undefined) {
                return res.status(StatusCodes.BAD_REQUEST).send({
                    message: 'Missing required fields: content, rating, opinion_date'
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


            const parsedOpinionDate = new Date(opinion_date);
            if (isNaN(parsedOpinionDate.getTime())) {
                return res.status(StatusCodes.BAD_REQUEST).send({
                    message: 'opinion_date must be a valid date string or timestamp'
                });
            }

            const now = new Date();
            const weekInMs = 7 * 24 * 60 * 60 * 1000;
            if (Math.abs(parsedOpinionDate.getTime() - now.getTime()) > weekInMs) {
                return res.status(StatusCodes.BAD_REQUEST).send({
                    message: 'opinion_date must be within one week of the current date'
                });
            }

            const opinion = new Opinion();
            opinion.rating = parsedRating;
            opinion.content = content;
            opinion.order = order;
            opinion.opinion_date = parsedOpinionDate;

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