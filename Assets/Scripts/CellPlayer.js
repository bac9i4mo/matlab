#pragma strict


var stepSize = 1.0;
var gridSize = 10;
var cellText : GameObject;

var uiWin : GameObject;
var uiLose : GameObject;

static var currentValue = 1;
private var cellTextText : TextMesh;


function Start() {
	currentValue = 1;
	transform.position.x = Random.Range(0,9);
	transform.position.x = Mathf.Round(transform.position.x);
	transform.position.y = Random.Range(0,9);
	transform.position.y = Mathf.Round(transform.position.y);
	cellTextText = cellText.GetComponent(TextMesh);
	GeneratePath();
}


var neighbourCell : GameObject;
var randomDir : Vector3[];

function GeneratePath() {
	var newPos = transform.position;
	for (var i = 2; i < 21; i++) {
		var oldPos = newPos;
		newPos += randomDir[Random.Range(0,randomDir.length)];
		var busyCell = Physics.Raycast(newPos - Vector3.forward, Vector3.forward);
		if (!busyCell && (newPos.x < gridSize) && (newPos.y < gridSize) && (newPos.x >= 0) && (newPos.y >= 0)) {
			var newClone : GameObject = Instantiate(neighbourCell, newPos, Quaternion.identity);
			if (i == 20) {
				newClone.name = "finish";
			} else {
				newClone.name = i.ToString();
			}
		} else {
			newPos = oldPos;
			i -= 1;
		}
	}
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
	}
}


private var allowMovementInput = true;
private var raycastDistance = 1.0;

function Movement(moveHorizontal : boolean, moveSign : int) {
	allowMovementInput = false;

	var neighbourValue : int;
	var neighbourExists = false;
	var consumingAllowed = false;

	var finished = false;

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
			neighbourValue = 20;
			finished = true;
		}
	}
/////////////// raycasting shit - move it to a separate method

	if (neighbourExists) {

	/////////////// checking neighbour value
		if (neighbourValue == currentValue + 1) {
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
		Application.LoadLevel(Application.loadedLevel);
	} else {
		for (var eachNeighbour in allNeighbours) {
			eachNeighbour.GetComponent(Neighbour).UpdateVisuals();
		}
	}
	yield WaitForFixedUpdate;
	allowMovementInput = true;
}


function Update () {
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