class ToolbarItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user_type: ""
    };
    this.handleUserTypeSelection = this.handleUserTypeSelection.bind(this);
  }

  handleUserTypeSelection(event) {
    this.setState({ user_type: event.target.value });
  }

  render() {
    const user_type = this.state.user_type;
    if (user_type === "User") {
      return React.createElement(
        "div",
        null,
        "User View"
      );
    } else if (user_type === "Helper") {
      return React.createElement(
        "div",
        null,
        "Helper View"
      );
    } else {
      console.log("HHHHH");
      return React.createElement(
        "div",
        null,
        React.createElement(
          "button",
          { onClick: this.handleUserTypeSelection, value: "User" },
          "User"
        ),
        React.createElement(
          "button",
          { onClick: this.handleUserTypeSelection, value: "Helper" },
          "Helper"
        )
      );
    }
  }
}

function App() {
  return React.createElement(
    "div",
    null,
    React.createElement(ToolbarItem, null)
  );
}

ReactDOM.render(React.createElement(App, null), document.getElementById('root'));
