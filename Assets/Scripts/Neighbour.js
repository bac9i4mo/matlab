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
		currentValue = 20*CellPlayer.rule;
		gameObject.tag = "Untagged";
		Destroy(cellText);
	} else {
		if (gameObject.name == "random_number") {
			currentValue = Random.Range(0, 20*CellPlayer.rule);
		} else {
			currentValue = int.Parse(gameObject.name)*CellPlayer.rule;
		}
	}
	UpdateVisuals();
}

function UpdateVisuals() {
	cellTextText.text = currentValue.ToString();
	if (gameObject.name == "finish") {
		GetComponent.<Renderer>().material = materialFinish;
	} else {
		gameObject.name = currentValue.ToString();
		if (currentValue == CellPlayer.currentValue + 1*CellPlayer.rule) {
			GetComponent.<Renderer>().material = materialGranted;
		} else {
			GetComponent.<Renderer>().material = materialDenied;
		}
	}
}