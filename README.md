# node-red-contrib-jambonz

[Node-RED](http://nodered.org/) nodes for [jambonz](https://github.com/jambonz).

This pallette contains a set of nodes that allow the user to create applications that respond to [jambonz webhooks](https://docs.jambonz.org/jambonz/).  

## Nodes

### webhook in
This node is used to receive and process an incoming webhook.  Every jambonz flow should begin with a `webhook in` node.

This node allows the user to specify the URL path for the webhook as well as http method: GET or PUT

### webook out
This node is used to respond to a webhook request, optionally sending back a jambonz application or an user authentication response.

### user auth
This node is used to validate a sip user authentication challenge.  The incoming webhook that is used for sip user authentication includes the components of the SIP Authorization header in `msg.authRequest`.  The `user auth` node allows the user to specify either the associated plaintext or hashed password and performs digest authentication to determine whether the user is authenticated.  The deterination is recorded in `msg.authResponse` which can subsequently be sent back to the jambonz platform via a `webhook out` node.

### conference
Connects a call into a [conference](https://docs.jambonz.org/jambonz/#conference)

### dequeue
The [dequeue](https://docs.jambonz.org/jambonz/#dequeue) verb removes the a call from the front of a specified queue and bridges that call to the current caller.

### dial
The [dial](https://docs.jambonz.org/jambonz/#dial) verb is used to create a new call by dialing out to a number, a registered sip user, a sip endpoint, or a Microsoft Teams user.

### dialogflow
The [dialogflow](https://docs.jambonz.org/jambonz/#dialogflow) verb is used to connect a call to a Google dialogflow bot.

### enqueue
The [enqueue](https://docs.jambonz.org/jambonz/#enqueue) command is used to place a caller in a queue.

### gather
The [gather](https://docs.jambonz.org/jambonz/#gather) command is used to collect dtmf or speech input.

### hangup
The [hangup](https://docs.jambonz.org/jambonz/#hangup) command terminates the call and ends the application

### leave
The [leave](https://docs.jambonz.org/jambonz/#leave) verb transfers a call out of a queue. The call then returns to the flow of execution following the enqueue verb that parked the call, or the document returned by that verbs actionHook property, if provided.

### listen
The [listen](https://docs.jambonz.org/jambonz/#listen) verb sends a real-time audio stream for a call to a websocket server.

### pause
The [pause](https://docs.jambonz.org/jambonz/#pause) command waits silently for a specified number of seconds.

### play
The [play](https://docs.jambonz.org/jambonz/#play) command is used to stream recorded audio to a call.

### redirect
The [redirect](https://docs.jambonz.org/jambonz/#redirect) action is used to transfer control to another JSON document taht is retrieved from the specified url. All actions after redirect are unreachable and ignored.

### say
The [say](https://docs.jambonz.org/jambonz/#say) command is used to send synthesized speech to the remote party. The text provided may be either plain text or may use SSML tags.

### sip:decline
The [sip:decline](https://docs.jambonz.org/jambonz/#sipdecline) action is used to reject an incoming call with a specific status and, optionally, a reason and SIP headers to include on the response.

### tag
The [tag](https://docs.jambonz.org/jambonz/#tag) verb is used to add properties to the standard call attributes that jambonz includes on every action or call status HTTP POST request.




