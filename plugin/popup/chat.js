class Space extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let s_but = null;
        let r_but = null;
        let content = null;
        return React.createElement(
            "div",
            null,
            "HelloWorld"
        );
    }
}

function App() {
    return React.createElement(
        "div",
        null,
        React.createElement(Space, null)
    );
}

ReactDOM.render(React.createElement(App, null), document.getElementById('root'));
