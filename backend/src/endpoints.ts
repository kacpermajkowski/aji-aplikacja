import { Express } from "express";

export function endpoints(app: Express){
    app.get('/products', (req, res) => {
        res.send('Hello World!3333')
    })

    app.get('products/:id', (req, res) => {
        res.send(`Product with id ${req.params.id}`)
    })

    app.post('/products', (req, res) => {
        res.send('Create Product')
    })

    app.get('/categories', (req, res) => {
        res.send('Categories List')
    })
}