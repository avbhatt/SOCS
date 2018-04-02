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

    loadUserView(curr_URL) {

      // may want to make separate sidebar class, constructed with params user/construction string and 
      // curr URL string 


      // open up sidebar loaded with desired user objects--chat box area, annotations for page
      // make ajax call to server, adding user to active_entities collection
      //  (of form user_id: {user/helper : string, curr_url : string, curr_chatting : boolean})? 

      // ajax call will return a list of annotations of form [{cateogry : string, content : string}] 
      // iterate thru list to make the expandable HTML list for annotation display 

      // add context menu object
    }

    loadHelperView(curr_URL) {

      // sidebar loaded with helper view--notifications area for users needing help, chat box space

      // make ajax call to server, giving user_type and curr_URL adding user to active_entities collection
      //  (of form user_id: {user/helper : string, curr_url : string, curr_chatting : boolean})? 

      // ajax call will return a list of users currently having requested help on a webpage, with which to populate 
      // notifications HTML object that will have event fired whenever clicked to open chat. 
    }


    render() {
      const user_type = this.state.user_type;
      if (user_type === "User") {
        // get current URL in window, call loadUserView 
        loadUserView("curr_url");
        return <div>User View</div>
      }
      else if (user_type === "Helper") {
        // get current URL in window

        loadHelperView("curr_url");
        return <div>Helper View</div> 

        // for both of these events, activate event to fire whenever URL changes to make ajax call to update 
        // that active_entity object. 

        // TODO: figure out if we can use meteor-like autopublish functionality, or is the client just going to have to 
        // re-render constantly?
      }
      else {
        return (
          <div>
            <button onClick={this.handleUserTypeSelection} value="User">User</button>
            <button onClick={this.handleUserTypeSelection} value="Helper">Helper</button>
          </div>
          );
      }
    }
}

class SideBarView extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
      <div>sidebar</div>
    }
}

class ContextMenu extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
      <div>context menu addition</div>
    }
}
  
function App() {
    return <div><ToolbarItem /></div>;
}

ReactDOM.render(React.createElement(App, null), document.getElementById('root'));
