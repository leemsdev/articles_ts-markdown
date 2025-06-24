import { useState } from 'react';
import './App.css';
import { tokenize } from './transpiler/tokens';
import { astToString, parse } from './transpiler/ast'

function App() {
	const [output, setOutput] = useState("")

	function onSourceChange(src: string) {
		let tokenized = tokenize(src)
		let parsed = astToString(parse(tokenized))

		setOutput(parsed)
	}

	return (
		<div className="App">
			<textarea className="src" onChange={e => onSourceChange(e.target.value)} />
			<div className="output">
				<pre>{output}</pre>
			</div>
		</div>
	);
}

export default App;
