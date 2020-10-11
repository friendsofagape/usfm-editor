import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

// Disable console.log when running tests
jest.spyOn(global.console, 'log').mockImplementation(() => jest.fn());