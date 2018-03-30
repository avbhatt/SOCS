class Space extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let s_but = null;
        let r_but = null;
        let content = null;
        return React.createElement("select", null,
         React.createElement("option", { value: 1 }, "1"),
         React.createElement("option", { value: 2 }, "2")
        );
    }
}

// class Dropdown extends React.Component {
//   constructor(props) {
//       super(props);
//   }
//   render() {
//     return (
//       <option>
//       <select>User</select>
//       <select>Helper</select>
//       </option>
//     );
//   }
//
// }

function App() {
    return React.createElement(
        "div",
        null,
        React.createElement(Space, null),
        // React.createElement(Dropdown, null)
    );
}

ReactDOM.render(React.createElement(App, null), document.getElementById('root'));
