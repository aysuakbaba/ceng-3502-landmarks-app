const request = require("supertest");
const fs = require("fs");
const app = require("../server.js");

describe("Landmarks", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(fs, "readFileSync").mockImplementation(() => {
      return JSON.stringify([
        {
          id: 3,
          name: "Eiffel Tower",
          description:
            "A wrought-iron lattice tower on the Champ de Mars in Paris, France.",
          location: {
            latitude: 48.8584,
            longitude: 2.2945,
          },
          category: "Monument",
        },
        {
          id: 4,
          name: "Machu Picchu",
          description:
            "An Incan citadel set high in the Andes Mountains in Peru.",
          location: {
            latitude: -13.1631,
            longitude: -72.545,
          },
          category: "Historical",
        },
        {
          id: 5,
          name: "Sydney Opera House",
          description:
            "A multi-venue performing arts centre in Sydney, Australia.",
          location: {
            latitude: -33.8568,
            longitude: 151.2153,
          },
          category: "Cultural",
        },
      ]);
    });

    jest.spyOn(fs, "writeFileSync").mockImplementation(() => {});
  });

  it("should get all landmarks", async () => {
    const response = await request(app).get("/api/landmarks").expect(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        name: expect.any(String),
        description: expect.any(String),
        location: expect.any(Object),
        category: expect.any(String),
      })
    );
  });

  it("should create a new landmark", async () => {
    const newLandmark = {
      name: "New Landmark",
      description: "A new landmark for testing",
      location: { lat: 40.7128, lng: -74.006 },
      category: "Test Category",
    };

    const response = await request(app)
      .post("/api/landmarks")
      .send(newLandmark)
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        name: newLandmark.name,
        description: newLandmark.description,
        location: newLandmark.location,
        category: newLandmark.category,
      })
    );
  });

  it("should get a landmark by ID", async () => {
    const response = await request(app).get("/api/landmarks/3").expect(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: 3,
        name: expect.any(String),
        description: expect.any(String),
        location: expect.any(Object),
        category: expect.any(String),
      })
    );
  });

  it("should update a landmark by ID", async () => {
    const updatedLandmark = {
      name: "Updated Landmark",
      description: "An updated landmark for testing",
      location: { lat: 40.7128, lng: -74.006 },
      category: "Updated Category",
    };

    const response = await request(app)
      .put("/api/landmarks/3")
      .send(updatedLandmark)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: 3,
        name: updatedLandmark.name,
        description: updatedLandmark.description,
        location: updatedLandmark.location,
        category: updatedLandmark.category,
      })
    );
  });
});
