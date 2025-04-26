const request = require("supertest");
const fs = require("fs");
const app = require("../server.js");

describe("Visited", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(fs, "readFileSync").mockImplementation(() => {
      return JSON.stringify([
        {
          id: 3,
          landmark_id: 5,
          visited_date: "2025-04-26",
          visitor_name: "John Doe",
        },
        {
          id: 4,
          landmark_id: 8,
          visited_date: "2023-09-15",
          visitor_name: "Jane Smith",
        },
        {
          id: 5,
          landmark_id: 12,
          visited_date: "2024-07-10",
          visitor_name: "Alice Johnson",
        },
      ]);
    });

    jest.spyOn(fs, "writeFileSync").mockImplementation(() => {});
  });
  it("should get all visited landmarks", async () => {
    const response = await request(app).get("/api/visited").expect(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        landmark_id: expect.any(Number),
        visited_date: expect.any(String),
        visitor_name: expect.any(String),
      })
    );
  });
  it("should create a new visited landmark", async () => {
    const newVisitedLandmark = {
      landmark_id: 10,
      visited_date: "2025-05-01",
      visitor_name: "Bob Brown",
    };

    const response = await request(app)
      .post("/api/visited")
      .send(newVisitedLandmark)
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        landmark_id: newVisitedLandmark.landmark_id,
        visited_date: newVisitedLandmark.visited_date,
        visitor_name: newVisitedLandmark.visitor_name,
      })
    );
  });
  it("should get a visited landmark by ID", async () => {
    const response = await request(app).get("/api/visited/3").expect(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: 3,
        landmark_id: expect.any(Number),
        visited_date: expect.any(String),
        visitor_name: expect.any(String),
      })
    );
  });
});
