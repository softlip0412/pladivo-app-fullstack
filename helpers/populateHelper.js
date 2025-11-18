import mongoose from "mongoose";

// Cấu hình populate theo collection
const populateConfig = {
  serviceOrders: [
    { path: "createdBy", select: "firstname lastname email role profile" },
    { path: "roomId", select: "name capacity features location" },
    { path: "reviews.userId", select: "firstname lastname email role" },
  ],
  tasks: [
    { path: "assignedTo", select: "firstname lastname email role profile" },
    { path: "createdBy", select: "firstname lastname email role profile" },
    { path: "eventPlanId", select: "title eventDate location status" },
    { path: "progressReports.reportedBy", select: "firstname lastname email role" },
  ],
  eventPlans: [
    { path: "createdBy", select: "firstname lastname email role profile" },
    { path: "tasks", select: "title description assignedTo status priority" },
  ],
  leaveRequests: [
    { path: "createdBy", select: "firstname lastname email role profile" },
    { path: "reviewedBy", select: "firstname lastname email role profile" },
  ],
  contracts: [
    { path: "createdBy", select: "firstname lastname email role profile" },
  ],
  equipment: [
    { path: "createdBy", select: "firstname lastname email role profile" },
  ],
  promotions: [
    { path: "createdBy", select: "firstname lastname email role profile" },
    { path: "approvedBy", select: "firstname lastname email role profile" },
  ],
  notifications: [
    { path: "recipientId", select: "firstname lastname email role profile" },
  ],
  users: [
    { path: "profile", select: "firstname lastname phone address avatar" },
  ],
  services: [
    { path: "createdBy", select: "firstname lastname email role profile" },
    { path: "roomId", select: "name capacity features location" },
  ],
  rooms: [
    { path: "serviceId", select: "name description category price" },
  ],
};

export async function getFullData(Model, filter = {}) {
  const collectionName = Model.collection.collectionName; // tự động lấy tên collection
  const populates = populateConfig[collectionName] || [];

  let query = Model.find(filter);

  // Apply populate
  populates.forEach((p) => {
    query = query.populate(p);
  });

  return await query.exec();
}
