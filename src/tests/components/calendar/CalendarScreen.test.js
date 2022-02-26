import { mount } from 'enzyme';
import React from 'react';
import { Provider } from 'react-redux';
import { act } from '@testing-library/react';

import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import '@testing-library/jest-dom';
import { CalendarScreen } from '../../../components/calendar/CalendarScreen';
import { messages } from '../../../helpers/calendar-messages-es';
import { types } from '../../../types/types';
import { eventSetActive } from '../../../actions/events';

jest.mock('../../../actions/events', () => ({
    eventSetActive: jest.fn(),
    eventStartLoading: jest.fn(),
}));
Storage.prototype.setItem = jest.fn();

const middelwares = [ thunk ];
const mockStore = configureStore(middelwares);

const initState = {
    calendar: {
        events: []
    },
    auth: {
        uid: '123',
        name: 'Johan'
    },
    ui: {
        modalOpen: false
    }
};
const store = mockStore(initState);
store.dispatch = jest.fn();

const wrapper = mount(
    <Provider store={store}>
        <CalendarScreen />
    </Provider>
)

describe('Pruebas en <CalendarScreen />', () => {

    test('debe de mostrarse correctmente', () => {
        expect(wrapper).toMatchSnapshot();
    });

    test('pruebas con las interaciones del calendario', () => {

        const calendar = wrapper.find('Calendar');

        // const calendarMessages = calendar.prop('messages');
        // expect(calendarMessages).toEqual(messages);

        calendar.prop('onDoubleClickEvent')();
        expect( store.dispatch ).toHaveBeenCalledWith({ type: types.uiOpenModal });
        
        calendar.prop('onSelectEvent')({ start: 'Hola' });
        expect( eventSetActive ).toHaveBeenCalledWith({ start: 'Hola' });

        act(() => {
            calendar.prop('onView')('week');
            expect( localStorage.setItem ).toHaveBeenCalledWith('lastView','week');
        });
    });

});