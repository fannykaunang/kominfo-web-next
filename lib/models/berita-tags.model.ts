// lib/models/berita-tags.model.ts

import { execute, query } from "../db-helpers";

/**
 * Sync berita tags - replace all tags for a berita
 * Hapus semua tag lama, lalu insert tag baru
 */
export async function syncBeritaTags(
  beritaId: string,
  tagIds: string[]
): Promise<void> {
  // Delete existing tags
  await execute(`DELETE FROM berita_tags WHERE berita_id = ?`, [beritaId]);

  // Insert new tags if any
  if (tagIds.length > 0) {
    // Build values for bulk insert
    const values = tagIds.map(() => "(?, ?)").join(", ");
    const params: string[] = [];

    tagIds.forEach((tagId) => {
      params.push(beritaId, tagId);
    });

    await execute(
      `INSERT INTO berita_tags (berita_id, tag_id) VALUES ${values}`,
      params
    );
  }
}

/**
 * Add tags to berita (without removing existing)
 */
export async function addTagsToBerita(
  beritaId: string,
  tagIds: string[]
): Promise<void> {
  if (tagIds.length === 0) return;

  const values = tagIds.map(() => "(?, ?)").join(", ");
  const params: string[] = [];

  tagIds.forEach((tagId) => {
    params.push(beritaId, tagId);
  });

  // Use INSERT IGNORE to skip duplicates
  await execute(
    `INSERT IGNORE INTO berita_tags (berita_id, tag_id) VALUES ${values}`,
    params
  );
}

/**
 * Remove tags from berita
 */
export async function removeTagsFromBerita(
  beritaId: string,
  tagIds: string[]
): Promise<void> {
  if (tagIds.length === 0) return;

  const placeholders = tagIds.map(() => "?").join(", ");
  await execute(
    `DELETE FROM berita_tags WHERE berita_id = ? AND tag_id IN (${placeholders})`,
    [beritaId, ...tagIds]
  );
}

/**
 * Remove all tags from berita
 */
export async function removeAllTagsFromBerita(beritaId: string): Promise<void> {
  await execute(`DELETE FROM berita_tags WHERE berita_id = ?`, [beritaId]);
}

/**
 * Get tag IDs by berita ID
 */
export async function getTagIdsByBeritaId(beritaId: string): Promise<string[]> {
  const results = await query<{ tag_id: string }>(
    `SELECT tag_id FROM berita_tags WHERE berita_id = ?`,
    [beritaId]
  );

  return results.map((r) => r.tag_id);
}

/**
 * Check if berita has tag
 */
export async function beritaHasTag(
  beritaId: string,
  tagId: string
): Promise<boolean> {
  const results = await query<any>(
    `SELECT COUNT(*) as count FROM berita_tags WHERE berita_id = ? AND tag_id = ?`,
    [beritaId, tagId]
  );

  return Number(results[0]?.count) > 0;
}
