import React, {useEffect, useState} from 'react';
import { v4 as uuid } from 'uuid';
import {connectWithPeer, onConnect} from "./app";

function App() {
  const [id, setId] = useState(uuid())

  useEffect(onConnect, [])

  return <div>
      <h1>Hello {id}</h1>
    </div>
}

export default App;
