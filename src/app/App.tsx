import React, { useState } from 'react';
import { Form } from './components/Form/Form';

function App(): JSX.Element {
  const [count, setCount] = useState<number>(0);

  return (
    <div>
      <Form />
    </div>
  );
}

export default App;
