class Space extends React.Component {
    constructor(props) {
        super(props);
        this.handleUserTypeSelect = this.handleUserTypeSelect.bind(this); 
    }

    handleUserTypeSelect(event) {
        console.log(event.value);
    }

    render() {
        let s_but = null;
        let r_but = null;
        let content = null;
        const user_type_list = ["User", "Helper"];
        const auth_obj = user_type_list.map(user_type => React.createElement(
            "option",
            { value: user_type, onChange: this.handleUserTypeSelect },
            user_type
        ));
        console.log(user_type_list);
        // return React.createElement(
        //     "input",
        //     null,
        //     auth_obj
        // );
        return React.createElement(
            "div",
            null,
            "Hello"
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
