import request from 'supertest'
import app from './app.js'
import { describe, it, test, beforeAll, beforeEach } from '@jest/globals';


describe("POST /log-chat", () => {

  describe("should respond with a 200 status code", () => {

    it("should return 200 OK when user id is string and chat_history is an array", async () => {
        const res = await request(app)
        .post('/log-chat')
        .send({
            user_id: 'user123',
            chat_history: ['Hello', 'How are you?']
        });

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe('Chat logged successfully.');
    });

    it('should return 200 OK for multiple chat history entries', async () => {
        const res = await request(app)
            .post('/log-chat')
            .send({
                user_id: 'user123',
                chat_history: ['Hello', 'I have a fever.', 'Can you help?']
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe('Chat logged successfully.');
    });

    it('should return 200 OK for very large chat_history', async () => {
        const largeChat = Array(1000).fill('Message');  // 1000 messages
        const res = await request(app)
            .post('/log-chat')
            .send({
                user_id: 'user123',
                chat_history: largeChat
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe('Chat logged successfully.');
    });

    it('should return 200 OK for chat_history with special characters', async () => {
        const res = await request(app)
            .post('/log-chat')
            .send({
                user_id: 'user123',
                chat_history: ['Hello 😊', 'I have a cold!']
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe('Chat logged successfully.');
    });

  })
  

  describe("should return 400 Bad Request", () => {

    it('should return 400 for empty chat_history', async () => {
        const res = await request(app)
            .post('/log-chat')
            .send({
                user_id: 'user123',
                chat_history: []
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toBe('Invalid input. chat_history must not be empty.');
    });

    it('should return 400 bad Request for missing user_id', async () => {
        const res = await request(app)
            .post('/log-chat')
            .send({
                chat_history: ['I have a headache.']
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toBe('Invalid input. user_id must be a string.');
    });

    it('should return 400 invalid chat_history type', async () => {
        const res = await request(app)
            .post('/log-chat')
            .send({
                user_id: 'user123',
                chat_history: 'I have a cold.'  // Invalid type
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toBe('Invalid input. chat_history must be an array.');
    });

    it('should return 400 Bad Request for missing chat_history', async () => {
        const res = await request(app)
            .post('/log-chat')
            .send({
                user_id: 'user123'
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toBe('Invalid input. chat_history must be an array.');
    });

    it('should return 400 Bad Request for attempted injection', async () => {
        const res = await request(app)
            .post('/log-chat')
            .send({
                user_id: 'user123',
                chat_history: ['DROP TABLE history;']
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toBe('Invalid input.');
    });

    it('should return 400 Bad Request for null values', async () => {
        const res = await request(app)
            .post('/log-chat')
            .send({
                user_id: null,
                chat_history: null
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toBe('Invalid input. user_id must be a string and chat_history must be an array.');
    });

    it('should return 400 Bad Request for chat_history exceeding size limit', async () => {
        const veryLargeChat = Array(10001).fill('Message');  // 10,001 messages (a limit of 10,000)
        const res = await request(app)
            .post('/log-chat')
            .send({
                user_id: 'user123',
                chat_history: veryLargeChat
            });
    
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toBe('Invalid input. chat_history exceeds size limit.');
    });

    it('should return 400 Bad Request for empty string user_id', async () => {
        const res = await request(app)
            .post('/log-chat')
            .send({
                user_id: '',
                chat_history: ['I feel tired.']
            });
    
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toBe('Invalid input. user_id must not be an empty string.');
    });
})

    describe("should return 405", () => {
        it('should return 405 Method Not Allowed for invalid HTTP methods', async () => {
            const res = await request(app)
                .put('/log-chat')  // Using PUT instead of POST
                .send({
                    user_id: 'user123',
                    chat_history: ['Feeling well.']
                });

            expect(res.statusCode).toEqual(405);
    });
    })

})