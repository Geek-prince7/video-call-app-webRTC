import {Route,Routes} from 'react-router-dom';
import './App.css';
import Lobby from './Screens/lobby';
import RoomPage from './Screens/Room';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<Lobby/>} />
        <Route path='/room/:roomId' element={<RoomPage/>} />
      </Routes>
      
    </div>
  );
}

export default App;
