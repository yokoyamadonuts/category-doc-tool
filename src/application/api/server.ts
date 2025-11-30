/**
 * Hono API Server
 * Implements: REQ-VIS-001, REQ-VIS-003
 *
 * REST API server for the CatDoc dashboard.
 */

import { Hono } from "hono";
import { cors } from "hono/cors";

import type { Category } from "../../domain/entities/Category";
import type { CategoryObject } from "../../domain/entities/Object";
import type { Morphism } from "../../domain/entities/Morphism";
import type { Functor } from "../../domain/entities/Functor";
import type { NaturalTransformation } from "../../domain/entities/NaturalTransformation";
import { validateAll } from "../cli/validate";
import { tracePath } from "../cli/trace";

// =============================================================================
// Types
// =============================================================================

/**
 * Data store for the API
 */
export type DataStore = {
  categories: Category[];
  functors: Functor[];
  naturalTransformations: NaturalTransformation[];
};

/**
 * Graph node for visualization
 */
export type GraphNode = {
  id: string;
  label: string;
  type: "object" | "category";
  domain?: string;
  categoryId?: string;
};

/**
 * Graph edge for visualization
 */
export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  label: string;
  type: "morphism" | "functor";
};

// =============================================================================
// API Factory
// =============================================================================

/**
 * Create Hono app with all routes
 */
export function createApp(data: DataStore): Hono {
  const app = new Hono();

  // CORS middleware
  app.use(
    "/api/*",
    cors({
      origin: "*",
      allowMethods: ["GET", "POST", "OPTIONS"],
      allowHeaders: ["Content-Type"],
    })
  );

  // Helper functions
  const getAllObjects = (): CategoryObject[] =>
    data.categories.flatMap((c) => c.objects);

  const getAllMorphisms = (): Morphism[] =>
    data.categories.flatMap((c) => c.morphisms);

  const findObjectById = (id: string): CategoryObject | undefined =>
    getAllObjects().find((o) => o.id === id);

  const findMorphismById = (id: string): Morphism | undefined =>
    getAllMorphisms().find((m) => m.id === id);

  const findCategoryById = (id: string): Category | undefined =>
    data.categories.find((c) => c.id === id);

  const findFunctorById = (id: string): Functor | undefined =>
    data.functors.find((f) => f.id === id);

  // ==========================================================================
  // Health Check
  // ==========================================================================

  app.get("/api/health", (c) => {
    return c.json({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  });

  // ==========================================================================
  // Objects
  // ==========================================================================

  app.get("/api/objects", (c) => {
    const domain = c.req.query("domain");
    let objects = getAllObjects();

    if (domain) {
      objects = objects.filter((o) => o.domain === domain);
    }

    return c.json({ objects });
  });

  app.get("/api/objects/:id", (c) => {
    const id = c.req.param("id");
    const object = findObjectById(id);

    if (!object) {
      return c.json({ error: `Object '${id}' not found` }, 404);
    }

    // Find related morphisms
    const morphisms = getAllMorphisms();
    const outgoing = morphisms.filter((m) => m.source === id);
    const incoming = morphisms.filter((m) => m.target === id);

    return c.json({
      object,
      outgoingMorphisms: outgoing,
      incomingMorphisms: incoming,
    });
  });

  // ==========================================================================
  // Morphisms
  // ==========================================================================

  app.get("/api/morphisms", (c) => {
    const source = c.req.query("source");
    const target = c.req.query("target");
    let morphisms = getAllMorphisms();

    if (source) {
      morphisms = morphisms.filter((m) => m.source === source);
    }
    if (target) {
      morphisms = morphisms.filter((m) => m.target === target);
    }

    return c.json({ morphisms });
  });

  app.get("/api/morphisms/:id", (c) => {
    const id = c.req.param("id");
    const morphism = findMorphismById(id);

    if (!morphism) {
      return c.json({ error: `Morphism '${id}' not found` }, 404);
    }

    return c.json({ morphism });
  });

  // ==========================================================================
  // Categories
  // ==========================================================================

  app.get("/api/categories", (c) => {
    const categories = data.categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      objectCount: cat.objects.length,
      morphismCount: cat.morphisms.length,
    }));

    return c.json({ categories });
  });

  app.get("/api/categories/:id", (c) => {
    const id = c.req.param("id");
    const category = findCategoryById(id);

    if (!category) {
      return c.json({ error: `Category '${id}' not found` }, 404);
    }

    return c.json({
      category: {
        id: category.id,
        name: category.name,
        objects: category.objects,
        morphisms: category.morphisms,
      },
    });
  });

  // ==========================================================================
  // Functors
  // ==========================================================================

  app.get("/api/functors", (c) => {
    const functors = data.functors.map((f) => ({
      id: f.id,
      name: f.name,
      sourceCategory: f.sourceCategory,
      targetCategory: f.targetCategory,
    }));

    return c.json({ functors });
  });

  app.get("/api/functors/:id", (c) => {
    const id = c.req.param("id");
    const functor = findFunctorById(id);

    if (!functor) {
      return c.json({ error: `Functor '${id}' not found` }, 404);
    }

    return c.json({
      functor: {
        id: functor.id,
        name: functor.name,
        sourceCategory: functor.sourceCategory,
        targetCategory: functor.targetCategory,
        objectMapping: Object.fromEntries(functor.objectMapping),
        morphismMapping: Object.fromEntries(functor.morphismMapping),
      },
    });
  });

  // ==========================================================================
  // Natural Transformations
  // ==========================================================================

  app.get("/api/natural-transformations", (c) => {
    const natTrans = data.naturalTransformations.map((nt) => ({
      id: nt.id,
      name: nt.name,
      sourceFunctor: nt.sourceFunctor,
      targetFunctor: nt.targetFunctor,
    }));

    return c.json({ naturalTransformations: natTrans });
  });

  app.get("/api/natural-transformations/:id", (c) => {
    const id = c.req.param("id");
    const natTrans = data.naturalTransformations.find((nt) => nt.id === id);

    if (!natTrans) {
      return c.json({ error: `Natural transformation '${id}' not found` }, 404);
    }

    return c.json({
      naturalTransformation: {
        id: natTrans.id,
        name: natTrans.name,
        sourceFunctor: natTrans.sourceFunctor,
        targetFunctor: natTrans.targetFunctor,
        components: Object.fromEntries(natTrans.components),
      },
    });
  });

  // ==========================================================================
  // Graph (for visualization)
  // ==========================================================================

  app.get("/api/graph", (c) => {
    const categoryId = c.req.query("category");

    let categories = data.categories;
    if (categoryId) {
      categories = categories.filter((cat) => cat.id === categoryId);
    }

    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    for (const category of categories) {
      // Add object nodes
      for (const obj of category.objects) {
        nodes.push({
          id: obj.id,
          label: obj.title,
          type: "object",
          domain: obj.domain,
          categoryId: category.id,
        });
      }

      // Add morphism edges
      for (const morph of category.morphisms) {
        edges.push({
          id: morph.id,
          source: morph.source,
          target: morph.target,
          label: morph.name,
          type: "morphism",
        });
      }
    }

    return c.json({ nodes, edges });
  });

  // ==========================================================================
  // Validate
  // ==========================================================================

  app.post("/api/validate", async (c) => {
    const result = validateAll({
      categories: data.categories,
      functors: data.functors,
      naturalTransformations: data.naturalTransformations,
    });

    return c.json({
      isValid: result.isValid,
      errors: result.errors,
      warnings: result.warnings,
      summary: result.summary,
    });
  });

  // ==========================================================================
  // Trace
  // ==========================================================================

  app.post("/api/trace", async (c) => {
    const body = await c.req.json();
    const { source, target, categoryId } = body;

    if (!source || !target) {
      return c.json({ error: "Missing source or target" }, 400);
    }

    // Find category
    let category: Category | undefined;
    if (categoryId) {
      category = findCategoryById(categoryId);
    } else {
      // Find category containing source object
      category = data.categories.find((cat) =>
        cat.objects.some((obj) => obj.id === source)
      );
    }

    if (!category) {
      return c.json({ error: "Category not found" }, 404);
    }

    const result = tracePath(source, target, category);

    return c.json({
      found: result.found,
      paths: result.paths.map((path) =>
        path.map((m) => ({
          id: m.id,
          name: m.name,
          source: m.source,
          target: m.target,
        }))
      ),
      shortestPath: result.shortestPath?.map((m) => ({
        id: m.id,
        name: m.name,
        source: m.source,
        target: m.target,
      })),
      shortestPathLength: result.shortestPathLength,
    });
  });

  // ==========================================================================
  // 404 Handler
  // ==========================================================================

  app.notFound((c) => {
    return c.json({ error: "Not found" }, 404);
  });

  return app;
}
