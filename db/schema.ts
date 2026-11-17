
import { pgTable, text, integer, timestamp, unique, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─── Instructors ────────────────────────────────────────────────────────────

export const instructors = pgTable('instructors', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    username: text('username').unique().notNull(),
    password: text('password').notNull(), // always bcrypt
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const instructorsRelations = relations(instructors, ({ many }) => ({
    classSessions: many(classSessions),
}));

// ─── Class Sessions ──────────────────────────────────────────────────────────

export const classSessions = pgTable('class_sessions', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    code: varchar('code').unique().notNull(),
    instructorId: integer('instructor_id').notNull().references(() => instructors.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const classSessionsRelations = relations(classSessions, ({ one, many }) => ({
    instructor: one(instructors, {
        fields: [classSessions.instructorId],
        references: [instructors.id],
    }),
    users: many(users),
}));

// ─── Sites ───────────────────────────────────────────────────────────────────

export const sites = pgTable('sites', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    name: text('name').notNull(),          // e.g. "ShopZone"
    slug: text('slug').unique().notNull(), // e.g. "shopzone"
    securityStage: text('security_stage').notNull(), // "plain-text" | "hashed" | "salted" | "full-security"
});

export const sitesRelations = relations(sites, ({ many }) => ({
    users: many(users),
}));

// ─── Users ───────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    password: text('password').notNull(),
    sessionId: integer('session_id').notNull().references(() => classSessions.id, { onDelete: 'cascade' }),
    siteId: integer('site_id').notNull().references(() => sites.id, { onDelete: 'cascade' }),
    creditCard: text('credit_card').notNull(),
    cardExpMonth: integer('card_exp_month').notNull(),
    cardExpYear: integer('card_exp_year').notNull(),
    cardCvc: text('card_cvc').notNull(),
    addressLine1: text('address_line_1').notNull(),
    addressLine2: text('address_line_2'),
    addressCity: text('address_city').notNull(),
    addressState: text('address_state').notNull(),
    addressZip: text('address_zip').notNull(),
    addressCountry: text('address_country').notNull(),
    phoneNumber: text('phone_number').notNull(),
}, (table) => [
    unique().on(table.email, table.sessionId, table.siteId),
]);

export const usersRelations = relations(users, ({ one }) => ({
    classSession: one(classSessions, {
        fields: [users.sessionId],
        references: [classSessions.id],
    }),
    site: one(sites, {
        fields: [users.siteId],
        references: [sites.id],
    }),
}));

// ─── Site Data ───────────────────────────────────────────────────────────────────

// TODO: Modify database design to accommodate creation of new websites with their unique data (multi tenant schema)