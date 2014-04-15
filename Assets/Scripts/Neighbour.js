#pragma strict

var cellText : GameObject;
private var cellTextText : TextMesh;
private var currentValue : int;
var materialGranted : Material;
var materialDenied : Material;
var materialFinish : Material;

function Start () {
	cellTextText = cellText.GetComponent(TextMesh);
	SetValue();
}

function SetValue() {
	yield WaitForFixedUpdate;
	if (gameObject.name == "finish") {
		currentValue = 20;
	} else {
		if (gameObject.name == "random_number") {
			currentValue = Random.Range(0, 20);
		} else {
			currentValue = int.Parse(gameObject.name);
		}
	}
	UpdateVisuals();
}

function UpdateVisuals() {
	cellTextText.text = currentValue.ToString();
	if (gameObject.name == "finish") {
		renderer.material = materialFinish;
	} else {
		gameObject.name = currentValue.ToString();
		if (currentValue == CellPlayer.currentValue + 1) {
			renderer.material = materialGranted;
		} else {
			renderer.material = materialDenied;
		}
	}
}