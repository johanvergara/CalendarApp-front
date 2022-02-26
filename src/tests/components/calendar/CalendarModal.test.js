import { mount } from 'enzyme';
import React from 'react';
import { Provider } from 'react-redux';
import moment from 'moment';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import '@testing-library/jest-dom';
import { CalendarModal } from '../../../components/calendar/CalendarModal';
import { eventClearActiveEvent, eventStartAddNew, eventStartUpdate } from '../../../actions/events';
import { act } from '@testing-library/react';
import Swal from 'sweetalert2';

jest.mock('sweetalert2', () => ({
    fire: jest.fn()
}));

jest.mock('../../../actions/events', () => ({
    eventStartUpdate: jest.fn(),
    eventClearActiveEvent: jest.fn(),
    eventStartAddNew: jest.fn(),
}));

const middelwares = [ thunk ];
const mockStore = configureStore(middelwares);

const now = moment().minutes(0).seconds(0).add(1, 'hours');
const nowPlus1 = now.clone().add(1, 'hours');

const initState = {
    calendar: {
        events: [],
        activeEvent: {
            title: 'Hola Mundo',
            notes: 'Algunas notas',
            start: now.toDate(),
            end: nowPlus1.toDate()
        }
    },
    auth: {
        uid: '123',
        name: 'Johan'
    },
    ui: {
        modalOpen: true
    }
};
const store = mockStore(initState);
store.dispatch = jest.fn();

const wrapper = mount(
    <Provider store={store}>
        <CalendarModal />
    </Provider>
);

describe('Pruebas en <CalendarModal />', () => {

    beforeEach(() => {
        jest.clearAllMocks()
    });

    test('debe de mostrar el modal', () => {
        // expect( wrapper.find('.modal').exists() ).toBe(true);
        expect( wrapper.find('Modal').prop('isOpen') ).toBe(true);
    });

    test('debe de llamar la accion de actualizar y cerrar el modal', () => {

        wrapper.find('form').simulate('submit', {
            preventDefault(){}
        });

        expect( eventStartUpdate ).toHaveBeenCalledWith(initState.calendar.activeEvent);
        expect( eventClearActiveEvent ).toHaveBeenCalledWith();

    });

    test('debe de mostrar error si falta el titulo', () => {

        wrapper.find('form').simulate('submit', {
            preventDefault(){}
        });

        expect( wrapper.find('input[name="title"]').hasClass('is-invalid') ).toBe(true);
    });

    test('debe de crear un nuevo event', () => {

        const initState = {
            calendar: {
                events: [],
                activeEvent: null
            },
            auth: {
                uid: '123',
                name: 'Johan'
            },
            ui: {
                modalOpen: true
            }
        };
        const store = mockStore(initState);
        store.dispatch = jest.fn();
        
        const wrapper = mount(
            <Provider store={store}>
                <CalendarModal />
            </Provider>
        );

        wrapper.find('input[name="title"]').simulate('change', {
            target: {
                name: 'title',
                value: 'Hola pruebas'
            }
        });
        wrapper.find('form').simulate('submit', {
            preventDefault(){}
        });

        expect( eventStartAddNew ).toHaveBeenCalledWith({
            end: expect.anything(),
            start: expect.anything(),
            title: 'Hola pruebas',
            notes: ''
        });

        expect( eventClearActiveEvent ).toHaveBeenCalled();

    });

    test('debe de validar las fechas', () => {

        wrapper.find('input[name="title"]').simulate('change', {
            target: {
                name: 'title',
                value: 'Hola pruebas'
            }
        });

        const hoy = new Date();

        act(() => {
            wrapper.find('DateTimePicker').at(1).prop('onChange')(hoy);
        });

        wrapper.find('form').simulate('submit', {
            preventDefault(){}
        });

        expect( Swal.fire ).toHaveBeenCalledWith("Error", "The end date must be greater than the start date", "error");

    });

});