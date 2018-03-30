// class Space extends React.Component {
//     constructor(props) {
//         super(props);
//     }

//     render() {
//         let s_but = null;
//         let r_but = null;
//         let content = null;
//         return React.createElement(
//             "div",
//             null,
//             "HelloWorld"
//         );
//     }
// }

// function App() {
//     return React.createElement(
//         "div",
//         null,
//         React.createElement(Space, null)
//     );
// }

// ReactDOM.render(React.createElement(App, null), document.getElementById('root'));


// var socket = io.connect('http://localhost:3002');
// socket.on('connect', function() {
//   console.log('Client connected');
// });

$(function (){
	var socket = io.connect('http://localhost:3002');
	$('form').submit(function(){
		socket.emit('chat message', $('#m').val());
		$('#m').val('');
		return false;
	});
	socket.on('chat message', function(msg){
		$('#messages').append($('<li>').text(msg));
	});
});	