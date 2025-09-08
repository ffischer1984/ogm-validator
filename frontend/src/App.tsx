import './App.scss'

import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'


// ____________________ Components ____________________
import FileValidator from './components/FileValidator';

export default function App() {
  return (
    <FileValidator />
  );
}
