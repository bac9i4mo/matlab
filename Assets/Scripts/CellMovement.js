#pragma strict


var stepSize = 1.0;
var gridSize = 10;
var cellText : GameObject;

private var allowMovementInput = true;
private var raycastDistance = 1.0;
private var currentValue = 1;
private var cellTextText : TextMesh;

function Start() {
	cellTextText = cellText.GetComponent(TextMesh);
}

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
		neighbourValue = int.Parse(hit.collider.name);
		print(neighbourExists);
		print ("neighbour: " + neighbourValue);
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
			print("current: " + currentValue);
		}
	}
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