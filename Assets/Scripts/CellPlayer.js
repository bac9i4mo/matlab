#pragma strict


var stepSize = 1.0;
var gridSize = 10;
static var rule = 1;
var cellText : GameObject;

var uiWin : GameObject;
var uiLose : GameObject;
var uiRule : GameObject;
var uiCover : GameObject;

private var finished = false;

static var currentValue = 1;
private var cellTextText : TextMesh;
private var uiRuleOriginalPos : Vector3;

function Start() {
	uiRule.GetComponent.<GUIText>().text = "rule:\n+" + rule.ToString();

	uiRule.GetComponent.<GUIText>().anchor = TextAnchor.MiddleCenter;
	uiRule.GetComponent.<GUIText>().fontSize = 128;
	uiRuleOriginalPos = uiRule.transform.position;
	uiRule.transform.position = Vector3(0.5, 0.5, 0);

	uiCover.SetActive(true);
	currentValue = rule;
	transform.position.x = Random.Range(1,8);
	transform.position.x = Mathf.Round(transform.position.x);
	transform.position.y = Random.Range(1,8);
	transform.position.y = Mathf.Round(transform.position.y);
	cellTextText = cellText.GetComponent(TextMesh);
	cellTextText.text = currentValue.ToString();
	GeneratePath();
	FX();
}


var neighbourCell : GameObject;
var randomDir : Vector3[];

function GeneratePath() {
	var generateAttempts = 0;
	var newPos = transform.position;
	for (var i = 2; i < 21; i++) {
		yield WaitForSeconds(0.0025);  //some kind of yield needed in generation loop to save from hanging up
		generateAttempts += 1;
		if (generateAttempts > 60) {
			// Cheap hack to avoid failed path builds
			Application.LoadLevel(Application.loadedLevel);
		}
		var oldPos = newPos;
		newPos += randomDir[Random.Range(0,randomDir.length)];
		var busyCell = Physics.Raycast(newPos - Vector3.forward, Vector3.forward);
		if (!busyCell && (newPos.x < gridSize) && (newPos.y < gridSize) && (newPos.x >= 0) && (newPos.y >= 0)) {
			var newClone : GameObject = Instantiate(neighbourCell, newPos, Quaternion.identity);
			if (i == 20) {
				newClone.name = "finish";
			} else {
				newClone.name = i.ToString();
				var newFakePos = newPos + randomDir[Random.Range(0,randomDir.length)];
				busyCell = Physics.Raycast(newFakePos - Vector3.forward, Vector3.forward);
				if (!busyCell && (newFakePos.x < gridSize) && (newFakePos.y < gridSize) && (newFakePos.x >= 0) && (newFakePos.y >= 0)) {
					var fakeClone : GameObject = Instantiate(neighbourCell, newFakePos, Quaternion.identity);
					fakeClone.name = (i + Random.Range(1,3)).ToString();
				}
			}
		} else {
			newPos = oldPos;
			i -= 1;
		}
	}
	uiRule.GetComponent.<GUIText>().anchor = TextAnchor.MiddleRight;
	uiRule.GetComponent.<GUIText>().fontSize = 32;
	uiRule.transform.position = uiRuleOriginalPos;
	uiCover.SetActive(false);
	GenerateFillEmpty();
}

function GenerateFillEmpty() {
	var newPos = Vector3.zero;
	for (var iy = 0; iy < 10; iy++) {
		for (var ix = 0; ix < 10; ix++) {
			var busyCell = Physics.Raycast(newPos - Vector3.forward, Vector3.forward);
			if (!busyCell) {
				var newClone : GameObject = Instantiate(neighbourCell, newPos, Quaternion.identity);
				newClone.name = "random_number";
			}
			newPos.x += 1;
		}
		newPos.x = 0;
		newPos.y += 1;
		yield WaitForFixedUpdate;
	}
}


private var allowMovementInput = true;
private var raycastDistance = 1.0;

function Movement(moveHorizontal : boolean, moveSign : int) {
	allowMovementInput = false;

	var neighbourValue : int;
	var neighbourExists = false;
	var consumingAllowed = false;


/////////////// raycasting shit - move it to a separate method
	var raycastDir = Vector3.zero;
	if (moveHorizontal) {
		raycastDir = Vector3.right * moveSign;
	} else {
		raycastDir = Vector3.up * moveSign;
	}
	var hit : RaycastHit;
	if (Physics.Raycast(transform.position, raycastDir, hit, raycastDistance)) {
		neighbourExists = true;
		if (hit.collider.name != "finish") {
			neighbourValue = int.Parse(hit.collider.name);
		} else {
			neighbourValue = 20*rule;
			finished = true;
		}
	}
/////////////// raycasting shit - move it to a separate method

	if (neighbourExists) {

	/////////////// checking neighbour value
		if (neighbourValue == currentValue + (1*rule)) {
			consumingAllowed = true;
		}
	/////////////// checking neighbour value

		if (consumingAllowed) {
			var newPosition : Vector3;
			if (moveHorizontal) {
				newPosition.x = transform.position.x + (stepSize * moveSign);
				newPosition.y = transform.position.y;
			} else {
				newPosition.x = transform.position.x;
				newPosition.y = transform.position.y + (stepSize * moveSign);
			}
			newPosition.x = Mathf.Round(newPosition.x);
			newPosition.y = Mathf.Round(newPosition.y);
			newPosition.z = transform.position.z;
			if ((newPosition.x < gridSize) && (newPosition.y < gridSize) && (newPosition.x >= 0) && (newPosition.y >= 0)) {
				for (var i = 0.0; i < 5.0; i++) {
					transform.position = Vector3.Lerp(transform.position, newPosition, i/5);
					hit.transform.localScale = Vector3.Lerp(transform.localScale, Vector3.zero, i/5);
					yield WaitForFixedUpdate;
				}
				transform.position = newPosition;
			}
			Destroy(hit.collider.gameObject);
			currentValue = neighbourValue;
			cellTextText.text = currentValue.ToString();
		}
	}
	yield WaitForFixedUpdate;
	var allNeighbours = GameObject.FindGameObjectsWithTag("neighbour");
	if (finished) {
		uiWin.SetActive(true);
		for (var eachNeighbour in allNeighbours) {
			for (var ia = 0.0; ia < 2.0; ia++) {
				eachNeighbour.transform.localScale = Vector3.Lerp(transform.localScale, Vector3.zero, ia/2);
				yield WaitForFixedUpdate;
			}
//			Destroy(eachNeighbour);
		}
		rule += 1;

		Application.LoadLevel(Application.loadedLevel);
	} else {
		for (var eachNeighbour in allNeighbours) {
			eachNeighbour.GetComponent(Neighbour).UpdateVisuals();
		}
	}
	yield WaitForFixedUpdate;

/////////////// Checking for possible further movements
	var possibleConsumables = false;
	for (var eachDirection in randomDir) {
		if (Physics.Raycast(transform.position, eachDirection, hit, raycastDistance)) {
			if (hit.collider.name == "finish") {
				possibleConsumables = true;
			} else {
				var possibleConsumablesValue = int.Parse(hit.collider.name);
			}
			if (possibleConsumablesValue == currentValue + (1 * rule)) { //rule here
				possibleConsumables = true;
			}
		}
	}
	if (!possibleConsumables) {
		uiLose.SetActive(true);
		yield WaitForSeconds (2.5);
		Application.LoadLevel(Application.loadedLevel);
	}
/////////////// Checking for possible further movements
	allowMovementInput = true;
}


var materialPulse : Material;

function FX() {
	var materialDefault = GetComponent.<Renderer>().material;
	while(!finished) {
		GetComponent.<Renderer>().material = materialPulse;
		yield WaitForSeconds(0.75);
		GetComponent.<Renderer>().material = materialDefault;
		yield WaitForSeconds(0.75);
	}
}



private var fp : Vector2;  // first finger position
private var lp : Vector2;  // last finger position

function Update () {

	for (var touch : Touch in Input.touches) {
		if (touch.phase == TouchPhase.Began) {
			fp = touch.position;
			lp = touch.position;
		}
		if (touch.phase == TouchPhase.Moved ) {
			lp = touch.position;
		}
		if(touch.phase == TouchPhase.Ended) {
			if((fp.x - lp.x) > 40) {
				if (allowMovementInput) {
					Movement(true, -1.0);
				}
			}
			else if((fp.x - lp.x) < -40) {
				if (allowMovementInput) {
					Movement(true, 1.0);
				}
			}
			else if((fp.y - lp.y) > 40 ) {
				if (allowMovementInput) {
					Movement(false, -1.0);
				}
			}
			else if((fp.y - lp.y) < -40 ) {
				if (allowMovementInput) {
					Movement(false, 1.0);
				}
			}
		}
	}

	if (Input.GetButtonDown("Horizontal")) {
		if (allowMovementInput) {
			Movement(true, Input.GetAxis("Horizontal"));
		}
	}
	if (Input.GetButtonDown("Vertical")) {
		if (allowMovementInput) {
			Movement(false, Input.GetAxis("Vertical"));
		}
	}
}


