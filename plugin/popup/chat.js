class Space extends React.Component {
    constructor(props) {
        super(props);
        this.handleSaveClick = this.handleSaveClick.bind(this);
        this.handleRestoreClick = this.handleRestoreClick.bind(this);
        this.handleBackClick = this.handleBackClick.bind(this);
        this.handleAllClick = this.handleAllClick.bind(this);
        this.state = { saves: true };
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
