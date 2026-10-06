import json
import numpy as np

from collections import Counter
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from joblib import dump


DATA_FILE = "data/asl-training-data.json"

TARGET_FRAMES = 30

ALLOWED_LABELS = {
    "Hello",
    "Hungry",
    "How"
}


# Load the dataset
with open(DATA_FILE, "r") as file:
    dataset = json.load(file)

samples = dataset["samples"]


# Only keep our 3 signs
samples = [
    sample
    for sample in samples
    if sample["label"] in ALLOWED_LABELS
]


print("Total recordings:", len(samples))

print(
    "Recordings per sign:",
    Counter(sample["label"] for sample in samples)
)


def hand_to_vector(hand):

    values = []

    for point in hand["landmarks"]:
        values.extend([
            point["x"],
            point["y"],
            point["z"]
        ])

    return np.array(values)


def frame_to_vector(frame):

    # 21 landmarks × 3 values = 63
    left_hand = np.zeros(63)
    right_hand = np.zeros(63)

    for hand in frame["hands"]:

        hand_vector = hand_to_vector(hand)

        if hand["handedness"] == "Left":
            left_hand = hand_vector

        elif hand["handedness"] == "Right":
            right_hand = hand_vector

    # Two hands = 126 numbers
    return np.concatenate([
        left_hand,
        right_hand
    ])


def recording_to_vector(sample):

    frames = sample["frames"]

    if len(frames) == 0:
        return None

    frame_vectors = [
        frame_to_vector(frame)
        for frame in frames
    ]

    # Convert every recording to exactly 30 frames
    indexes = np.linspace(
        0,
        len(frame_vectors) - 1,
        TARGET_FRAMES
    ).astype(int)

    selected_frames = [
        frame_vectors[index]
        for index in indexes
    ]

    return np.concatenate(selected_frames)


X = []
y = []


for sample in samples:

    features = recording_to_vector(sample)

    if features is not None:

        X.append(features)
        y.append(sample["label"])


X = np.array(X)
y = np.array(y)


print("X shape:", X.shape)
print("Labels:", np.unique(y))


# Split data:
# 80% training
# 20% testing
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)


model = RandomForestClassifier(
    n_estimators=300,
    random_state=42
)


print("Training model...")


model.fit(
    X_train,
    y_train
)


predictions = model.predict(X_test)


accuracy = accuracy_score(
    y_test,
    predictions
)


print("Accuracy:", accuracy)


dump(
    model,
    "asl_model.joblib"
)


print("Model saved as asl_model.joblib")