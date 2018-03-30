class ToolbarItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          user_type : ""
        };
        this.handleUserTypeSelection = this.handleUserTypeSelection.bind(this);
    }

    handleUserTypeSelection(event) {
      this.setState({user_type : event.target.value})
    }

    render() {
      const user_type = this.state.user_type;
      if (user_type === "User") {
        return <div>User View</div>
      }
      else if (user_type === "Helper") {
        return <div>Helper View</div> 
      }
      else {
        console.log("HHHHH");
        return (
          <div>
            <button onClick={this.handleUserTypeSelection} value="User">User</button>
            <button onClick={this.handleUserTypeSelection} value="Helper">Helper</button>
          </div>
          );
      }
    }
}
  
function App() {
    return <div><ToolbarItem /></div>;
}

ReactDOM.render(React.createElement(App, null), document.getElementById('root'));
