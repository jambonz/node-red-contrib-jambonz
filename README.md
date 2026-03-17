# node-red-contrib-jambonz

[Node-RED](http://nodered.org/) nodes for [jambonz](https://github.com/jambonz).

This palette contains a set of nodes that allow the user to create applications that respond to [jambonz webhooks](https://docs.jambonz.org/jambonz/).

## Documentation
https://docs.jambonz.org/verbs/verbs/overview

## Implemented nodes

### alert
The [alert](https://docs.jambonz.org/verbs/verbs/alert) verb raises an alert in the jambonz platform.

### answer
The [answer](https://docs.jambonz.org/verbs/verbs/answer) verb answers the call.

### conference
The [conference](https://docs.jambonz.org/verbs/verbs/conference) verb connects a call into a conference.

### config
The [config](https://docs.jambonz.org/verbs/verbs/config) verb updates default session settings (speech, barge-in, recording, etc.) for subsequent verbs.

### create call
Creates an outbound call via the jambonz REST API.

### create sms
Creates an outbound SMS message via the jambonz REST API.

### dequeue
The [dequeue](https://docs.jambonz.org/verbs/verbs/dequeue) verb removes a call from the front of a specified queue and bridges that call to the current caller.

### dial
The [dial](https://docs.jambonz.org/verbs/verbs/dial) verb is used to create a new call by dialing out to a number, a registered sip user, a sip endpoint, or a Microsoft Teams user.

### dialogflow
The [dialogflow](https://docs.jambonz.org/verbs/verbs/dialogflow) verb is used to connect a call to a Google dialogflow bot.

### dtmf
The [dtmf](https://docs.jambonz.org/verbs/verbs/dtmf) verb sends DTMF digits on the call.

### dub
The [dub](https://docs.jambonz.org/verbs/verbs/dub) verb adds or controls additional audio tracks mixed into the call.

### enqueue
The [enqueue](https://docs.jambonz.org/verbs/verbs/enqueue) command is used to place a caller in a queue.

### gather
The [gather](https://docs.jambonz.org/verbs/verbs/gather) command is used to collect dtmf or speech input.

### generic verb
Sends any Jambonz verb with custom JSON attributes.

### get alerts
Retrieves alert records for an account.

### get call
Retrieves info for a single call.

### get calls
Retrieves info for a group of calls.

### get recent calls
Retrieves recent call detail records (CDRs) with paging.

### hangup
The [hangup](https://docs.jambonz.org/verbs/verbs/hangup) command terminates the call and ends the application.

### lcc
Performs live call control on an active call via the jambonz REST API.

### leave
The [leave](https://docs.jambonz.org/verbs/verbs/leave) verb transfers a call out of a queue. The call then returns to the flow of execution following the enqueue verb that parked the call, or the document returned by that verb's actionHook property, if provided.

### listen
The [listen](https://docs.jambonz.org/verbs/verbs/listen) verb sends a real-time audio stream for a call to a websocket server.

### message
Sends an SMS message using the `message` verb.

### pause
The [pause](https://docs.jambonz.org/verbs/verbs/pause) verb waits silently for a specified number of seconds.

### play
The [play](https://docs.jambonz.org/verbs/verbs/play) verb is used to stream recorded audio to a call.

### rasa
The [rasa](https://docs.jambonz.org/verbs/verbs/rasa) verb connects a call to a Rasa assistant.

### redirect
The [redirect](https://docs.jambonz.org/verbs/verbs/redirect) action is used to transfer control to another JSON document that is retrieved from the specified url. All actions after redirect are unreachable and ignored.

### say
The [say](https://docs.jambonz.org/verbs/verbs/say) verb is used to send synthesized speech to the remote party. The text provided may be either plain text or may use SSML tags.

### sip:decline
The [sip:decline](https://docs.jambonz.org/verbs/verbs/sip-decline) verb is used to reject an incoming call with a specific status and, optionally, a reason and SIP headers to include on the response.

### sip:refer
The [sip:refer](https://docs.jambonz.org/verbs/verbs/sip-refer) verb transfers a call via SIP REFER.

### sip:request
The [sip:request](https://docs.jambonz.org/verbs/verbs/sip-request) verb sends a SIP INFO, NOTIFY, or MESSAGE request on an active call leg.

### tag
The [tag](https://docs.jambonz.org/verbs/verbs/tag) verb is used to add properties to the standard call attributes that jambonz includes on every action or call status HTTP POST request.

### user auth
This node is used to validate a sip user authentication challenge. The incoming webhook that is used for sip user authentication includes the components of the SIP Authorization header in `msg.authRequest`. The `user auth` node allows the user to specify either the associated plaintext or hashed password and performs digest authentication to determine whether the user is authenticated. The determination is recorded in `msg.authResponse` which can subsequently be sent back to the jambonz platform via a `webhook out` node.

### webhook in
This node is used to receive and process an incoming webhook. Every jambonz flow should begin with a `webhook in` node.

This node allows the user to specify the URL path for the webhook as well as http method: GET or POST.

### webhook out
This node is used to respond to a webhook request, optionally sending back a jambonz application or a user authentication response.




