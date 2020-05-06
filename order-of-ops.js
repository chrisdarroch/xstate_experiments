const assert = require('assert');
const { Machine, interpret } = require('xstate');

const orderMachine = Machine({
    id: 'orders',
    initial: 'choosing',
    context: {
        take: null,
        place: null,
        orders: 0,
    },
    states: {
        choosing: {
            on: {
                'CHOICE': {
                    target: 'review',
                    actions: ['setChoice'],
                },
            },
        },
        review: {
            on: {
                'CONFIRM': {
                    target: 'processed',
                    actions: ['consumeOrder'],
                },
            },
        },
        processed: {
            on: {
                '': [
                    { target: 'allDone', cond: 'enoughOrders' },
                    { target: 'choosing' },
                ],
            },
        },
        allDone: {
            type: 'final'
        }
    },
}, {
    actions: {
        setChoice: (ctx, e) => {
            ctx.take = e.take;
            ctx.place = e.place;
        },
        consumeOrder: (ctx, e) => {
            console.log('consumeOrder', ctx);
            ctx.take = null;
            ctx.place = null;
            ctx.orders += 1;
        }
    },
    guards: {
        enoughOrders: (ctx, e) => {
            console.log('enoughOrders', ctx);
            ctx.orders > 2;
        },
    }
});

const service = interpret(orderMachine)
    .onTransition(state => console.log('transition:', state.value, state.context))
    .start();

service.send('CHOICE', { take: 'this', place: 'there' });
service.send('CONFIRM');
service.send('CHOICE', {});
service.send('CONFIRM');
service.send('CHOICE', {});
service.send('CONFIRM');

assert.equal(service.state.value, 'allDone');