#pragma strict

var cellText : GameObject;
private var cellTextText : TextMesh;
private var currentValue : int;
var materialGranted : Material;
var materialDenied : Material;

function Start () {
	cellTextText = cellText.GetComponent(TextMesh);
	SetValue();
	UpdateVisuals();
}

function SetValue() {
	currentValue = Random.Range(0, 20);
}

function UpdateVisuals() {
	gameObject.name = currentValue.ToString();
	cellTextText.text = currentValue.ToString();
	if (currentValue == CellPlayer.currentValue + 1) {
		renderer.material = materialGranted;
	} else {
		renderer.material = materialDenied;
	}
}