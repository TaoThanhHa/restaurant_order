--
-- PostgreSQL database dump
--

\restrict RRkakAELHrWfeAvS8c1WFE8DrA6hh0IXDfALIchK3Ht9rnOichfXYu28WplUvAw

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: DiningSessionStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."DiningSessionStatus" AS ENUM (
    'ACTIVE',
    'CLOSED'
);


--
-- Name: FoodStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."FoodStatus" AS ENUM (
    'AVAILABLE',
    'OUT_OF_STOCK',
    'INACTIVE'
);


--
-- Name: KitchenItemStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."KitchenItemStatus" AS ENUM (
    'WAITING',
    'PREPARING',
    'READY',
    'COMPLETED',
    'CANCELLED'
);


--
-- Name: KitchenMode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."KitchenMode" AS ENUM (
    'SCREEN',
    'PRINT'
);


--
-- Name: OrderItemStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OrderItemStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'PREPARING',
    'SERVED',
    'CANCELLED'
);


--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'PREPARING',
    'SERVED',
    'COMPLETED',
    'CANCELLED'
);


--
-- Name: OrderType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OrderType" AS ENUM (
    'DINE_IN',
    'TAKE_AWAY'
);


--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'CASH',
    'BANKING',
    'MIXED'
);


--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'UNPAID',
    'PAID'
);


--
-- Name: ReservationStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ReservationStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'CHECKED_IN',
    'CANCELLED',
    'COMPLETED',
    'NO_SHOW'
);


--
-- Name: RestaurantMode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."RestaurantMode" AS ENUM (
    'SINGLE',
    'MULTI'
);


--
-- Name: ServiceRequestStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ServiceRequestStatus" AS ENUM (
    'PENDING',
    'ACCEPTED',
    'COMPLETED',
    'CANCELLED'
);


--
-- Name: TableStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TableStatus" AS ENUM (
    'AVAILABLE',
    'OCCUPIED',
    'RESERVED',
    'DISABLED'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: branch_foods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.branch_foods (
    id integer NOT NULL,
    branch_id integer NOT NULL,
    food_id integer NOT NULL,
    status public."FoodStatus" DEFAULT 'AVAILABLE'::public."FoodStatus" NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: branch_foods_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.branch_foods_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: branch_foods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.branch_foods_id_seq OWNED BY public.branch_foods.id;


--
-- Name: branches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.branches (
    id integer NOT NULL,
    name text NOT NULL,
    address text,
    phone text,
    email text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    restaurant_id integer,
    "kitchenMode" public."KitchenMode" DEFAULT 'PRINT'::public."KitchenMode" NOT NULL
);


--
-- Name: branches_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.branches_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: branches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.branches_id_seq OWNED BY public.branches.id;


--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cart_items (
    id integer NOT NULL,
    "cartId" integer NOT NULL,
    "foodId" integer NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    note text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: cart_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cart_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cart_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cart_items_id_seq OWNED BY public.cart_items.id;


--
-- Name: carts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.carts (
    id integer NOT NULL,
    "customerId" integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: carts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.carts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: carts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.carts_id_seq OWNED BY public.carts.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    restaurant_id integer NOT NULL
);


--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers (
    id integer NOT NULL,
    session_id integer,
    name text,
    guest_token text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    password text,
    phone text,
    email text,
    "isGuest" boolean DEFAULT true NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    device_id text,
    table_id integer,
    "emailOtp" text,
    "emailOtpExpiresAt" timestamp(3) without time zone,
    "currentOrderId" integer,
    avatar text,
    "expiredAt" timestamp(3) without time zone,
    restaurant_id integer
);


--
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- Name: dining_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dining_sessions (
    id integer NOT NULL,
    table_id integer NOT NULL,
    status public."DiningSessionStatus" DEFAULT 'ACTIVE'::public."DiningSessionStatus" NOT NULL,
    "startedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "closedAt" timestamp(3) without time zone,
    ended_by integer,
    note text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    reservation_id integer
);


--
-- Name: dining_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dining_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dining_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dining_sessions_id_seq OWNED BY public.dining_sessions.id;


--
-- Name: email_change_otps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_change_otps (
    id integer NOT NULL,
    user_id integer NOT NULL,
    new_email text NOT NULL,
    otp text NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: email_change_otps_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.email_change_otps_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: email_change_otps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.email_change_otps_id_seq OWNED BY public.email_change_otps.id;


--
-- Name: floors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.floors (
    id integer NOT NULL,
    branch_id integer NOT NULL,
    floor_number integer NOT NULL,
    name text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: floors_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.floors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: floors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.floors_id_seq OWNED BY public.floors.id;


--
-- Name: foods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.foods (
    id integer NOT NULL,
    category_id integer NOT NULL,
    name text NOT NULL,
    price numeric(12,2) NOT NULL,
    description text,
    image text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    restaurant_id integer NOT NULL
);


--
-- Name: foods_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.foods_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: foods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.foods_id_seq OWNED BY public.foods.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer NOT NULL,
    food_id integer NOT NULL,
    quantity integer NOT NULL,
    status public."OrderItemStatus" DEFAULT 'PENDING'::public."OrderItemStatus" NOT NULL,
    price numeric(12,2) NOT NULL,
    note text,
    kitchen_completed_at timestamp(3) without time zone,
    kitchen_ready_at timestamp(3) without time zone,
    kitchen_sent_at timestamp(3) without time zone,
    kitchen_status public."KitchenItemStatus" DEFAULT 'WAITING'::public."KitchenItemStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: order_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_members (
    id integer NOT NULL,
    customer_id integer NOT NULL,
    order_id integer NOT NULL,
    joined_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: order_members_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.order_members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: order_members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.order_members_id_seq OWNED BY public.order_members.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    order_code text NOT NULL,
    branch_id integer NOT NULL,
    session_id integer,
    "orderType" public."OrderType" DEFAULT 'DINE_IN'::public."OrderType" NOT NULL,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    total_amount numeric(12,2) DEFAULT 0 NOT NULL,
    note text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    created_by_customer_id integer,
    created_by_user_id integer
);


--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: password_reset_otps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_reset_otps (
    id integer NOT NULL,
    email text NOT NULL,
    otp text NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: password_reset_otps_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.password_reset_otps_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: password_reset_otps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.password_reset_otps_id_seq OWNED BY public.password_reset_otps.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    order_id integer NOT NULL,
    payment_method public."PaymentMethod" NOT NULL,
    "cashAmount" numeric(65,30),
    "bankAmount" numeric(65,30),
    payment_code text,
    total_amount numeric(12,2) NOT NULL,
    payment_status public."PaymentStatus" DEFAULT 'UNPAID'::public."PaymentStatus" NOT NULL,
    paid_at timestamp(3) without time zone
);


--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: reservation_tables; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reservation_tables (
    reservation_id integer NOT NULL,
    table_id integer NOT NULL
);


--
-- Name: reservations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reservations (
    id integer NOT NULL,
    customer_name text NOT NULL,
    customer_phone text NOT NULL,
    number_of_guests integer NOT NULL,
    reservation_time timestamp(3) without time zone NOT NULL,
    status public."ReservationStatus" DEFAULT 'PENDING'::public."ReservationStatus" NOT NULL,
    note text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    restaurant_id integer NOT NULL,
    branch_id integer NOT NULL,
    cancelled_at timestamp(3) without time zone,
    checked_in_at timestamp(3) without time zone,
    completed_at timestamp(3) without time zone,
    created_by_id integer NOT NULL,
    duration_minutes integer DEFAULT 90 NOT NULL,
    no_show_at timestamp(3) without time zone,
    reminder_called_at timestamp(3) without time zone
);


--
-- Name: reservations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reservations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reservations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reservations_id_seq OWNED BY public.reservations.id;


--
-- Name: restaurants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.restaurants (
    id integer NOT NULL,
    name text NOT NULL,
    logo text,
    admin_id integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    mode public."RestaurantMode" DEFAULT 'SINGLE'::public."RestaurantMode" NOT NULL
);


--
-- Name: restaurants_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.restaurants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: restaurants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.restaurants_id_seq OWNED BY public.restaurants.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: service_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_requests (
    id integer NOT NULL,
    branch_id integer NOT NULL,
    table_id integer NOT NULL,
    customer_id integer,
    message text NOT NULL,
    status public."ServiceRequestStatus" DEFAULT 'PENDING'::public."ServiceRequestStatus" NOT NULL,
    handled_by_id integer,
    handled_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: service_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.service_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: service_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.service_requests_id_seq OWNED BY public.service_requests.id;


--
-- Name: tables; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tables (
    id integer NOT NULL,
    floor_id integer NOT NULL,
    table_number integer NOT NULL,
    qr_code text NOT NULL,
    status public."TableStatus" DEFAULT 'AVAILABLE'::public."TableStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    capacity integer DEFAULT 4 NOT NULL
);


--
-- Name: tables_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tables_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tables_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tables_id_seq OWNED BY public.tables.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    email text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "mustChangePassword" boolean DEFAULT true NOT NULL,
    role_id integer NOT NULL,
    branch_id integer,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    restaurant_id integer
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: branch_foods id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branch_foods ALTER COLUMN id SET DEFAULT nextval('public.branch_foods_id_seq'::regclass);


--
-- Name: branches id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branches ALTER COLUMN id SET DEFAULT nextval('public.branches_id_seq'::regclass);


--
-- Name: cart_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items ALTER COLUMN id SET DEFAULT nextval('public.cart_items_id_seq'::regclass);


--
-- Name: carts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carts ALTER COLUMN id SET DEFAULT nextval('public.carts_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- Name: dining_sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dining_sessions ALTER COLUMN id SET DEFAULT nextval('public.dining_sessions_id_seq'::regclass);


--
-- Name: email_change_otps id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_change_otps ALTER COLUMN id SET DEFAULT nextval('public.email_change_otps_id_seq'::regclass);


--
-- Name: floors id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.floors ALTER COLUMN id SET DEFAULT nextval('public.floors_id_seq'::regclass);


--
-- Name: foods id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.foods ALTER COLUMN id SET DEFAULT nextval('public.foods_id_seq'::regclass);


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: order_members id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_members ALTER COLUMN id SET DEFAULT nextval('public.order_members_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: password_reset_otps id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_otps ALTER COLUMN id SET DEFAULT nextval('public.password_reset_otps_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: reservations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservations ALTER COLUMN id SET DEFAULT nextval('public.reservations_id_seq'::regclass);


--
-- Name: restaurants id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.restaurants ALTER COLUMN id SET DEFAULT nextval('public.restaurants_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: service_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_requests ALTER COLUMN id SET DEFAULT nextval('public.service_requests_id_seq'::regclass);


--
-- Name: tables id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tables ALTER COLUMN id SET DEFAULT nextval('public.tables_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
463815a8-2338-4aae-a375-1104a0f67448	3eee417aa0458db136e4185ab6e7721ec41931aeaa053b4a8f19301e867fda7d	2026-09-17 20:39:06.536103+07	20260917133906_add_reservation_branch_and_creator	\N	\N	2026-09-17 20:39:06.335948+07	1
8fa7b5c3-7d58-465a-9512-8870aeb759fc	ec2b7eb4bc53d9d921c63c3a90dee9784fe65d7eafa4f09cbb681f66799ba5c0	2026-07-28 21:31:36.8552+07	20260728142525_init	\N	\N	2026-07-28 21:31:36.550519+07	1
39e9699b-837a-49e3-b2ec-d754e69b1c1e	0a21e6331bfa270d20a4fe1f6561ba16892f1c689f580b38b142d7077435a32a	2026-08-24 15:15:19.040694+07	20260824081518_add_inventory_management	\N	\N	2026-08-24 15:15:18.967679+07	1
c3a6986f-3d3b-4197-b9c5-4f72f74d7bf8	b0306f9b02bc3dc85501f84c8ed389242da9651e91cffda98be2ee9662120e9d	2026-07-31 20:38:53.142064+07	20260731133852_password_reset_otp	\N	\N	2026-07-31 20:38:52.905959+07	1
e370c8e2-dd31-4a86-8fa0-e827c1839777	29c8e61ecc1980d623f20419f2b8e95214cb5eb80307bebb7d4cce7795b30aea	2026-08-01 12:39:58.950647+07	20260801053958_customer	\N	\N	2026-08-01 12:39:58.834563+07	1
b78f67e2-b960-462c-9277-988eb2bb18c0	ef6158627c5e1025fc2273ecaad8c68518aa46399e78bc7aa2c57296ee349701	2026-08-04 14:49:51.33838+07	20260804074951_add_customer_active	\N	\N	2026-08-04 14:49:51.233964+07	1
6ae16db4-40e7-4933-bdc2-9c32bc1235e3	719d9b3ae22bc30b577f6327624020d1ad41b395b9bf5f0494eb83387e2c86ce	2026-09-03 14:52:05.913828+07	20260903075205_add_order_name	\N	\N	2026-09-03 14:52:05.721564+07	1
30b1a0a0-3e34-45dd-b953-87a31a3bf643	a9b1c65b2c9b7dfa6051700f12b2f49ce3bb5ec3911ee825de8a42b4098bd655	2026-08-04 14:52:00.027593+07	20260804075159_add_customer_active	\N	\N	2026-08-04 14:51:59.936596+07	1
ed76d382-331d-4004-8ad5-92f6f6af11a2	508adc22f12f1d5d0d27d606b50b29ba410f479c46aee8103190068fc0a98471	2026-08-07 17:02:26.361932+07	20260807100226_add_customer_table	\N	\N	2026-08-07 17:02:26.216318+07	1
2ccc6795-a645-4f7f-ab3e-adfeb82b918a	3219e16c36ba368560833a845b57a0c31483e974cb2675353e13057505039c83	2026-08-11 20:28:57.525887+07	20260811132857_add_customer_email	\N	\N	2026-08-11 20:28:57.474679+07	1
121e10a6-e80b-49b8-a80e-4e851a3d4de4	ea87cfdf9b3fbbb6a221ac4ea6e06da7d7b68b5f9e2eb640b999373c31dad757	2026-09-07 21:09:07.649628+07	20260907140907_add_kitchen_item_status	\N	\N	2026-09-07 21:09:07.472999+07	1
f6cb47fe-7ae5-443f-abd1-e21a16ca2d37	e0e010c663ed3cece81e6b560f95b0d8eca7a2fa175c3fbd926e7d6a24803036	2026-08-18 15:28:33.586408+07	20260818082833_add_restaurant_admin_profile	\N	\N	2026-08-18 15:28:33.310085+07	1
7ff89b1e-cf95-441c-8d3c-6ddc3beeda6c	3456ff43d72fb3666b563b491d2bde258dc6c01cad82161e26c7c050026aaf7c	2026-08-23 12:03:30.12808+07	20260823050329_add_reservation_tables	\N	\N	2026-08-23 12:03:29.805097+07	1
d6e7ef2b-f88b-4c5c-9f11-f99cb848703e	1d7111f4656fbb8024300e17d52607dbc069a820caf618c82d9906cf545de264	2026-08-23 15:09:36.425639+07	20260823080936_add_service_requests	\N	\N	2026-08-23 15:09:36.23596+07	1
10ea2c0f-eb31-4c4e-96bd-40ddc00a292b	dc05280e499a72d348bbc2d57922a837e3e1a00c747d42dfd39c3680387904f2	2026-09-07 21:58:56.289176+07	20260907145856_add_time	\N	\N	2026-09-07 21:58:56.249827+07	1
e96e466a-0e8d-4801-a8c7-18df67b23ede	fca6ebafac1d87086e8d8d7aaf8c60cd799e258bf7b1a80dd0c1fbcd58f40a55	2026-08-23 17:34:19.557859+07	20260823103419_add_customer_current_order	\N	\N	2026-08-23 17:34:19.415561+07	1
e127d9a0-3997-4b7a-a535-594b2b9f948c	445720fa02e542b51b1182659cc3c8cc34d16fd1ff51157e581eed147ae97e92	2026-08-23 17:50:31.318083+07	20260823105031_add_customer_avatar	\N	\N	2026-08-23 17:50:31.309767+07	1
7c092f2b-3516-4ddd-8e31-1cd981f7eb85	6b6bf29ca7e28b300caf2809b49fe9cb280f5f9356d8acc221eaf00c3c643bba	2026-08-24 11:42:50.242607+07	20260824044249_add_food_ingredient	\N	\N	2026-08-24 11:42:49.872982+07	1
b0857835-620a-4f49-999a-fdf7dc5f15fe	d269e957262a0e26c0a15d1bb674237e81224cb9831c8f65022d53504b2a9152	2026-09-11 09:36:06.324559+07	20260911023606_add_restaurant_id_to_users	\N	\N	2026-09-11 09:36:06.201666+07	1
6ee013b3-4edb-4952-94bd-5a3e0974028d	6b7c3e4492b4e3277ef48bfed8947b0ffe78d5c23b2831a91aea0a176e8f65f0	2026-09-14 15:55:05.992063+07	20260914085505_add_restaurant_mode	\N	\N	2026-09-14 15:55:05.882091+07	1
a47b1d3d-efe7-48db-ac11-1567dbd360f6	99be7cfa2ca6e8ee6e0c71512587d82714a915d59c6c00592e9bef9e91d170ac	2026-09-15 18:00:04.929972+07	20260915110004_add_restaurant_id_to_customers	\N	\N	2026-09-15 18:00:04.663503+07	1
01ab9d29-e015-4a14-971f-1226d697f8d9	9bd55f4db5637348cb12cb04411eb59e42b6a6a1f05eff7ad2e52f6da9a6609f	2026-09-15 21:22:35.106637+07	20260915142048_add_restaurant_id2	\N	\N	2026-09-15 21:22:34.733837+07	1
\.


--
-- Data for Name: branch_foods; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.branch_foods (id, branch_id, food_id, status, updated_at) FROM stdin;
4	1	4	AVAILABLE	2026-07-28 14:31:38.703
6	1	6	AVAILABLE	2026-07-28 14:31:38.707
7	1	7	AVAILABLE	2026-07-28 14:31:38.71
8	1	8	AVAILABLE	2026-07-28 14:31:38.712
9	1	9	AVAILABLE	2026-07-28 14:31:38.715
10	1	10	AVAILABLE	2026-07-28 14:31:38.717
12	1	12	AVAILABLE	2026-07-28 14:31:38.721
13	1	13	AVAILABLE	2026-07-28 14:31:38.723
14	1	14	AVAILABLE	2026-07-28 14:31:38.727
16	1	16	AVAILABLE	2026-07-28 14:31:38.733
18	1	18	AVAILABLE	2026-07-28 14:31:38.738
19	1	19	AVAILABLE	2026-07-28 14:31:38.74
20	1	20	AVAILABLE	2026-07-28 14:31:38.742
99	3	1	AVAILABLE	2026-09-16 09:38:33.308
11	1	11	AVAILABLE	2026-09-16 09:38:49.849
51	3	11	AVAILABLE	2026-09-16 09:38:49.857
137	5	15	AVAILABLE	2026-09-16 13:25:15.675
138	5	5	AVAILABLE	2026-09-16 13:25:15.675
139	5	11	AVAILABLE	2026-09-16 13:25:15.675
140	5	4	AVAILABLE	2026-09-16 13:25:15.675
141	5	6	AVAILABLE	2026-09-16 13:25:15.675
142	5	7	AVAILABLE	2026-09-16 13:25:15.675
143	5	8	AVAILABLE	2026-09-16 13:25:15.675
144	5	9	AVAILABLE	2026-09-16 13:25:15.675
145	5	10	AVAILABLE	2026-09-16 13:25:15.675
146	5	12	AVAILABLE	2026-09-16 13:25:15.675
147	5	13	AVAILABLE	2026-09-16 13:25:15.675
44	3	4	AVAILABLE	2026-08-10 04:24:03.153
46	3	6	AVAILABLE	2026-08-10 04:24:03.153
47	3	7	AVAILABLE	2026-08-10 04:24:03.153
48	3	8	AVAILABLE	2026-08-10 04:24:03.153
49	3	9	AVAILABLE	2026-08-10 04:24:03.153
50	3	10	AVAILABLE	2026-08-10 04:24:03.153
52	3	12	AVAILABLE	2026-08-10 04:24:03.153
53	3	13	AVAILABLE	2026-08-10 04:24:03.153
54	3	14	AVAILABLE	2026-08-10 04:24:03.153
56	3	16	AVAILABLE	2026-08-10 04:24:03.153
57	3	18	AVAILABLE	2026-08-10 04:24:03.153
58	3	19	AVAILABLE	2026-08-10 04:24:03.153
59	3	20	AVAILABLE	2026-08-10 04:24:03.153
148	5	14	AVAILABLE	2026-09-16 13:25:15.675
149	5	16	AVAILABLE	2026-09-16 13:25:15.675
150	5	18	AVAILABLE	2026-09-16 13:25:15.675
151	5	19	AVAILABLE	2026-09-16 13:25:15.675
152	5	20	AVAILABLE	2026-09-16 13:25:15.675
153	5	21	AVAILABLE	2026-09-16 13:25:15.675
63	4	4	AVAILABLE	2026-08-24 07:41:17.357
154	5	3	AVAILABLE	2026-09-16 13:25:15.675
65	4	6	AVAILABLE	2026-08-24 07:41:17.357
66	4	7	AVAILABLE	2026-08-24 07:41:17.357
67	4	8	AVAILABLE	2026-08-24 07:41:17.357
68	4	9	AVAILABLE	2026-08-24 07:41:17.357
69	4	10	AVAILABLE	2026-08-24 07:41:17.357
155	5	2	AVAILABLE	2026-09-16 13:25:15.675
71	4	12	AVAILABLE	2026-08-24 07:41:17.357
72	4	13	AVAILABLE	2026-08-24 07:41:17.357
73	4	14	AVAILABLE	2026-08-24 07:41:17.357
156	5	1	AVAILABLE	2026-09-16 13:25:15.675
75	4	16	AVAILABLE	2026-08-24 07:41:17.357
76	4	18	AVAILABLE	2026-08-24 07:41:17.357
77	4	19	AVAILABLE	2026-08-24 07:41:17.357
78	4	20	AVAILABLE	2026-08-24 07:41:17.357
104	4	22	AVAILABLE	2026-09-18 03:26:19.859
61	3	17	INACTIVE	2026-09-19 13:51:48.585
157	5	17	INACTIVE	2026-09-19 13:51:48.593
130	1	17	INACTIVE	2026-09-19 13:51:48.595
85	1	1	AVAILABLE	2026-09-20 02:12:39.562
101	1	21	OUT_OF_STOCK	2026-09-20 02:12:44.433
102	3	21	AVAILABLE	2026-09-15 14:54:58.674
103	4	21	AVAILABLE	2026-09-15 14:54:58.674
107	1	3	AVAILABLE	2026-09-16 09:24:35.906
108	3	3	AVAILABLE	2026-09-16 09:24:35.921
15	1	15	AVAILABLE	2026-09-16 09:38:03.418
55	3	15	AVAILABLE	2026-09-16 09:38:03.424
5	1	5	AVAILABLE	2026-09-16 09:38:12.252
45	3	5	AVAILABLE	2026-09-16 09:38:12.259
42	3	2	INACTIVE	2026-09-16 09:38:18.165
2	1	2	AVAILABLE	2026-09-16 09:38:18.174
\.


--
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.branches (id, name, address, phone, email, "isActive", created_at, restaurant_id, "kitchenMode") FROM stdin;
1	Hoàng Mai	Linh Đàm, Hoàng Mai, Hà Nội	0900000001	thanhhha1306@gmail.com	t	2026-07-28 14:31:38.3	1	PRINT
4	Đống Đa	Đống Đa	0396799684	hieutminh99@gmail.com	t	2026-08-24 07:41:17.324	2	PRINT
3	Hà Đông	12 Trần Phú, Hà Đông, Hà Nội	0900000003	streamnhacan2@gmail.com	t	2026-08-10 04:24:03.14	1	PRINT
5	Hoàn Kiếm	Phố Hàng bồ	0900000006	streamnhacan1@gmail.com	t	2026-09-16 13:25:15.654	1	PRINT
\.


--
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cart_items (id, "cartId", "foodId", quantity, note, created_at) FROM stdin;
1	1	5	2	Ít cơm	2026-07-28 14:31:38.866
2	1	13	1	Không đá	2026-07-28 14:31:38.871
\.


--
-- Data for Name: carts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.carts (id, "customerId", created_at, updated_at) FROM stdin;
1	1	2026-07-28 14:31:38.859	2026-07-28 14:31:38.859
5	8	2026-08-04 08:12:09.276	2026-08-04 08:12:09.276
6	9	2026-08-04 08:50:28.188	2026-08-04 08:50:28.188
7	11	2026-08-04 08:51:42.432	2026-08-04 08:51:42.432
10	15	2026-08-05 09:45:40.34	2026-08-05 09:45:40.34
11	16	2026-08-05 09:56:01.051	2026-08-05 09:56:01.051
12	17	2026-08-05 10:13:47.419	2026-08-05 10:13:47.419
13	23	2026-08-07 10:08:56.566	2026-08-07 10:08:56.566
14	24	2026-08-07 10:21:43.232	2026-08-07 10:21:43.232
15	25	2026-08-09 05:08:21.508	2026-08-09 05:08:21.508
16	69	2026-08-11 04:37:01.974	2026-08-11 04:37:01.974
17	73	2026-08-11 07:16:30.557	2026-08-11 07:16:30.557
18	78	2026-08-11 08:23:12.918	2026-08-11 08:23:12.918
19	79	2026-08-11 14:25:08.673	2026-08-11 14:25:08.673
20	80	2026-08-11 14:53:52.124	2026-08-11 14:53:52.124
21	81	2026-08-17 08:38:55.908	2026-08-17 08:38:55.908
22	100	2026-08-23 05:06:26.176	2026-08-23 05:06:26.176
23	102	2026-08-23 06:52:54.635	2026-08-23 06:52:54.635
24	103	2026-08-23 07:01:30.913	2026-08-23 07:01:30.913
25	104	2026-08-23 10:41:23.517	2026-08-23 10:41:23.517
26	106	2026-08-24 02:12:33.628	2026-08-24 02:12:33.628
27	110	2026-08-25 09:25:14.266	2026-08-25 09:25:14.266
28	114	2026-09-03 08:36:02.531	2026-09-03 08:36:02.531
29	122	2026-09-07 12:14:34.248	2026-09-07 12:14:34.248
30	123	2026-09-07 12:15:37.541	2026-09-07 12:15:37.541
31	203	2026-09-19 15:57:12.437	2026-09-19 15:57:12.437
32	227	2026-09-22 14:41:05.58	2026-09-22 14:41:05.58
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, name, description, created_at, restaurant_id) FROM stdin;
1	Bún	Các món bún	2026-07-28 14:31:38.59	1
2	Cơm	Các món cơm	2026-07-28 14:31:38.596	1
3	Lẩu	Các món lẩu	2026-07-28 14:31:38.599	1
4	Đồ uống	Các loại nước uống	2026-07-28 14:31:38.601	1
5	Tráng miệng	Các món tráng miệng	2026-07-28 14:31:38.604	1
8	Phở Bún	\N	2026-09-15 14:56:33.748	2
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customers (id, session_id, name, guest_token, created_at, password, phone, email, "isGuest", "isActive", device_id, table_id, "emailOtp", "emailOtpExpiresAt", "currentOrderId", avatar, "expiredAt", restaurant_id) FROM stdin;
145	81	Khách bàn 3	\N	2026-09-15 11:19:05.021	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
147	82	Khách bàn 2	\N	2026-09-15 13:22:41.15	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
149	82	Khách bàn 2	\N	2026-09-15 13:28:16.583	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
152	78	Khách bàn 1	\N	2026-09-16 03:39:30.415	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
154	85	Khách bàn 1	\N	2026-09-16 03:46:06.368	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
155	85	Khách bàn 1	\N	2026-09-16 03:49:49.421	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
158	87	Khách bàn 1	\N	2026-09-16 09:54:43.188	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
160	88	Khách bàn 1	\N	2026-09-16 12:30:24.851	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
100	\N	Tuyết Mai	\N	2026-08-23 05:06:26.144	$2b$10$XSfLozOK29cQO2hNOiK5Hu1AtxJoFpYvXoy3vSIR5nNlToYDiEWg.	0396799605	akaruitsuki1602@gmail.com	f	t	\N	\N	\N	\N	74	/uploads/customers/1787490962339-503413550.jpg	\N	1
114	\N	Phương	\N	2026-09-03 08:36:02.507	$2b$10$sttJzqHTYLvwSt4klUkMfu/JKfYyDFVOt.7/Z.sii0Zl4JTJkjyOq	0396123456	mieumieu1k99@gmail.com	f	t	\N	\N	\N	\N	88	\N	\N	2
122	\N	Hà	\N	2026-09-07 12:14:34.243	$2b$10$ufZE4Cu.kQQnNmP8DCHTyuaXfj5DNrzUl2XTR6.GNWfoPzSA1Gih2	0932123123	streamnhacan1@gmail.com	f	t	\N	5	\N	\N	94	\N	\N	1
123	\N	Linh	\N	2026-09-07 12:15:37.537	$2b$10$dya0v6aKdqzgDEbbaF9Nc.BDfQoupIG8KA8LVUpg7H.5YnlEl7UmW	0241784929	streamnhacan2@gmail.com	f	t	\N	5	\N	\N	96	\N	\N	1
163	92	Khách bàn 3	\N	2026-09-17 13:17:00.142	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
167	102	Khách bàn 1	\N	2026-09-19 05:32:41.701	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
173	102	Khách bàn 10	\N	2026-09-19 06:04:30.608	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
175	102	Khách bàn 10	\N	2026-09-19 06:05:48.101	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
169	102	Khách bàn 2	\N	2026-09-19 05:43:49.955	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
171	102	Khách bàn 2	\N	2026-09-19 05:49:47.565	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
176	102	Khách bàn 2	\N	2026-09-19 06:08:58.343	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
178	104	Khách bàn 2	\N	2026-09-19 13:50:35.698	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
181	107	Khách bàn 3	\N	2026-09-19 14:18:04.712	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
183	107	Khách bàn 2	\N	2026-09-19 14:53:35.141	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
186	107	Khách bàn 3	\N	2026-09-19 15:07:17.274	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
188	107	Khách bàn 3	\N	2026-09-19 15:10:34.768	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
189	107	Khách bàn 3	\N	2026-09-19 15:10:54.27	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
191	107	Khách bàn 3	\N	2026-09-19 15:14:36.105	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
194	107	Khách bàn 3	\N	2026-09-19 15:19:54.318	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
195	107	Khách bàn 3	\N	2026-09-19 15:19:58.254	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
197	107	Khách bàn 3	\N	2026-09-19 15:31:46.761	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
199	107	Khách bàn 3	\N	2026-09-19 15:32:56.588	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
200	107	Khách bàn 3	\N	2026-09-19 15:33:00.296	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
202	107	Khách bàn 3	\N	2026-09-19 15:36:47.892	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
205	111	Khách bàn 2	\N	2026-09-20 01:38:57.077	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
207	112	Khách bàn 5	\N	2026-09-20 02:57:41.114	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
209	111	Khách bàn 2	\N	2026-09-20 02:58:10.886	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
212	113	Khách bàn 2	\N	2026-09-20 03:45:28.095	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
215	113	Khách bàn 2	\N	2026-09-20 09:22:04.197	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
217	115	Khách bàn 5	\N	2026-09-20 10:24:47.945	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
216	113	Khách bàn 1	\N	2026-09-20 10:19:19.758	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
220	116	Khách bàn 1	\N	2026-09-22 13:55:54.408	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
221	117	Khách bàn 1	\N	2026-09-22 14:02:30.735	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
222	117	Khách bàn 1	\N	2026-09-22 14:02:30.867	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
223	117	Khách bàn 1	\N	2026-09-22 14:02:30.985	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
224	118	Khách bàn 1	\N	2026-09-22 14:03:24.028	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
225	119	Khách bàn 1	\N	2026-09-22 14:05:19.752	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
226	120	Khách bàn 2	\N	2026-09-22 14:23:07.513	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
227	\N	\N	f80d3c7f-1d5a-44e5-b4b8-f7c92ece1fcd	2026-09-22 14:41:05.572	\N	\N	\N	t	t	6c69720a-d6ef-4d6f-a916-d7ba5bd898b4	1	\N	\N	\N	\N	2026-09-25 14:41:05.57	1
228	121	Khách bàn 1	\N	2026-09-22 14:45:05.465	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
229	121	Khách bàn 1	\N	2026-09-22 14:48:03.032	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
230	\N	Khách vãng lai	\N	2026-09-22 14:48:16.061	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	2
112	60	Khách bàn 4	\N	2026-09-03 03:46:36.365	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
113	60	Khách bàn 4	\N	2026-09-03 08:01:59.054	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
105	52	Khách bàn 3	\N	2026-08-23 15:07:47.251	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
81	\N	Phương	\N	2026-08-17 08:38:55.827	$2b$10$WLEXiihAKxOIgKRqSwwdG.JtaYQdm1Wgs1eVu9H/PY3utaXp6m2s6	0921765398	thaopnguyen162@gmail.com	f	t	\N	\N	\N	\N	76	\N	\N	\N
107	56	Khách bàn 1	\N	2026-08-24 05:01:42.997	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
108	57	Khách bàn 2	\N	2026-08-24 07:46:51.291	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
110	\N	\N	c00dff3f-afc7-491f-a08b-8bbb0c579866	2026-08-25 09:25:14.262	\N	\N	\N	t	t	9b9dc3ed-c92f-48b5-8b98-ba1b372e7430	\N	\N	\N	87	\N	\N	\N
1	1	Nguyễn Văn A	\N	2026-07-28 14:31:38.803	$2b$10$FMVD53YQINdIs8BkSJfa9.1vzmA4io6hlgBkmh8AbhBYhvTy1nU1q	0909999999	\N	t	t	\N	\N	\N	\N	80	\N	\N	\N
109	58	Khách bàn 5	\N	2026-08-25 07:30:43.499	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
8	12	\N	357d4d0c-716a-4cd3-9064-8c90448f80bf	2026-08-04 08:12:09.272	\N	\N	\N	t	t	7d2aa9f7-5673-4111-847c-d047be266cd5	\N	\N	\N	82	\N	\N	\N
115	63	Khách bàn 1	\N	2026-09-03 08:52:14.528	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
116	64	Khách bàn 10	\N	2026-09-03 08:55:25.28	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
117	65	Khách bàn 8	\N	2026-09-03 08:57:22.532	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
118	66	Khách bàn 1	\N	2026-09-03 09:01:13.991	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
125	69	Khách bàn 5	\N	2026-09-07 15:00:31.14	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
69	\N	\N	\N	2026-08-11 04:37:01.941	\N	\N	\N	t	f	ab56a47c-8395-4bd4-b401-f41a6072b2d5	5	\N	\N	\N	\N	\N	\N
124	68	Khách bàn 1	\N	2026-09-07 14:43:24.013	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
126	46	Khách bàn 3	\N	2026-09-07 15:04:10.306	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
127	70	Khách bàn 10	\N	2026-09-07 15:09:42.327	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
128	71	Khách bàn 8	\N	2026-09-07 15:19:20.364	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
129	72	Khách bàn 6	\N	2026-09-07 15:19:52.235	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
130	73	Khách bàn 10	\N	2026-09-07 15:21:21.108	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
131	74	Khách bàn 9	\N	2026-09-07 15:30:39.836	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
132	75	Khách bàn 4	\N	2026-09-08 02:35:03.636	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
133	76	Khách bàn 6	\N	2026-09-08 02:36:50.222	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
79	\N	\N	\N	2026-08-11 14:25:08.617	\N	\N	\N	t	f	0c5a5ce4-eee7-4502-8de5-5ebffba0bda5	\N	\N	\N	\N	\N	\N	\N
134	77	Khách bàn 1	\N	2026-09-10 02:42:55.133	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
135	77	Khách bàn 1	\N	2026-09-10 02:43:37.638	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
136	77	Khách bàn 1	\N	2026-09-10 02:45:41.601	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
137	77	Khách bàn 1	\N	2026-09-10 02:48:38.837	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
138	78	Khách bàn 1	\N	2026-09-10 02:51:40.622	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
139	79	Khách bàn 2	\N	2026-09-10 02:59:26.382	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
140	78	Khách bàn 1	\N	2026-09-10 02:59:35.886	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
141	78	Khách bàn 1	\N	2026-09-15 08:06:02.393	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
142	78	Khách bàn 1	\N	2026-09-15 08:52:53.85	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
143	78	Khách bàn 1	\N	2026-09-15 09:20:39.368	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
144	79	Khách bàn 2	\N	2026-09-15 09:24:12.797	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
2	1	Khách vãng lai	guest-demo-token	2026-07-28 14:31:38.81	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	1
3	1	Trần Văn B	\N	2026-07-28 14:31:38.846	$2b$10$FMVD53YQINdIs8BkSJfa9.1vzmA4io6hlgBkmh8AbhBYhvTy1nU1q	0908888888	\N	t	t	\N	\N	\N	\N	\N	\N	\N	1
4	2	Khách bàn 7	\N	2026-07-31 01:57:34.483	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	1
9	6	\N	b128d003-141d-4d07-8b88-9c2239880682	2026-08-04 08:50:28.166	\N	\N	\N	t	t	0ee31e20-6b95-4795-9933-5be4d12247fb	\N	\N	\N	\N	\N	\N	1
17	\N	\N	4294f1bc-77f5-40de-9d70-fdf79ee8f764	2026-08-05 10:13:47.407	\N	\N	\N	t	t	7b3c8a81-ac54-4f71-a9a5-3697ea76f047	\N	\N	\N	\N	\N	\N	1
18	5	Khách bàn 2	\N	2026-08-07 03:49:20.358	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	1
19	10	Khách bàn 1	\N	2026-08-07 08:49:15.991	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	1
20	11	Khách bàn 5	\N	2026-08-07 09:01:50.868	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	1
76	13	Khách bàn 8	\N	2026-08-11 07:30:34.433	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	1
73	\N	\N	106d15a9-561f-4f9e-9e5f-4fe1f431c70a	2026-08-11 07:16:30.493	\N	\N	\N	t	t	8fa44363-7890-46ed-95b9-5f343778748d	\N	\N	\N	\N	\N	\N	1
77	16	Khách bàn 1	\N	2026-08-11 07:59:48.278	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	1
89	28	Khách bàn 1	\N	2026-08-20 13:31:09.412	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	1
90	28	Khách bàn 1	\N	2026-08-20 13:54:05.195	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	1
91	29	Khách bàn 2	\N	2026-08-20 14:03:11.544	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	1
92	29	Khách bàn 2	\N	2026-08-20 14:03:20.759	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	1
93	29	Khách bàn 2	\N	2026-08-20 14:05:44.994	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	1
23	\N	\N	7869bb84-8b9d-47c2-b792-67575e2e4891	2026-08-07 10:08:56.557	\N	\N	\N	t	t	742a578e-8616-46e5-a5fc-4af6c9128c54	\N	\N	\N	\N	\N	\N	1
16	\N	\N	e7df207a-6b25-490f-806e-90674e3a25ec	2026-08-05 09:56:01.042	\N	\N	\N	t	t	5dc9a159-fef8-49b3-b390-5d0bf3c186aa	\N	\N	\N	\N	\N	\N	1
15	\N	\N	75217d45-189b-4e46-8df1-abc14fdf27b4	2026-08-05 09:45:40.328	\N	\N	\N	t	t	56d01933-399e-42a4-b70c-53eb4505d265	\N	\N	\N	\N	\N	\N	1
78	\N	Mai Tuyết	\N	2026-08-11 08:23:12.91	$2b$10$RLA5pQvlgnlzNTrXz1mBZO6exDpO/9Kn1HmgzzYe.srt/.aVvFpMW	0921030405	bedta12401@gmail.com	f	t	\N	\N	\N	\N	\N	\N	\N	1
24	\N	\N	542ed464-0697-4b73-b9a7-dc53890a3a93	2026-08-07 10:21:43.214	\N	\N	\N	t	t	99559159-6f08-46b5-a081-b6d312d1139a	\N	\N	\N	\N	\N	\N	1
25	\N	\N	80c0bdeb-29a9-4cc5-801d-43630ec6d9cc	2026-08-09 05:08:21.481	\N	\N	\N	t	t	10b48b62-cce3-404b-b6e6-8b9973869061	\N	\N	\N	\N	\N	\N	1
26	12	Khách bàn 2	\N	2026-08-10 02:35:28.751	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	1
94	31	Khách bàn 5	\N	2026-08-20 14:19:02.378	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	1
82	22	Khách bàn 2	\N	2026-08-17 09:09:38.028	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	1
83	23	Khách bàn 7	\N	2026-08-17 09:24:45.436	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	1
84	25	Khách bàn 2	\N	2026-08-17 14:15:27.225	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	1
85	26	Khách bàn 3	\N	2026-08-20 12:47:18.88	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	1
86	27	Khách bàn 1	\N	2026-08-20 12:51:45.866	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	1
87	28	Khách bàn 1	\N	2026-08-20 13:30:49.832	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	1
88	28	Khách bàn 1	\N	2026-08-20 13:31:02.791	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	1
95	32	Khách bàn 2	\N	2026-08-20 15:15:50.693	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	1
96	33	Khách bàn 3	\N	2026-08-20 15:22:59.191	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	1
97	34	Khách bàn 4	\N	2026-08-21 03:49:05.942	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	1
98	35	Khách bàn 2	\N	2026-08-21 12:14:49.766	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	1
99	36	Khách bàn 1	\N	2026-08-21 12:54:26.804	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	1
101	40	Khách bàn 3	\N	2026-08-23 05:31:48.524	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	1
102	\N	\N	8e181df1-40a0-44a4-b367-199ffb98ab91	2026-08-23 06:52:54.606	\N	\N	\N	t	t	806245cf-4112-4477-8941-705bdc141419	\N	\N	\N	\N	\N	\N	1
103	\N	\N	05d62245-1268-4d77-ae30-4b2b4195c913	2026-08-23 07:01:30.909	\N	\N	\N	t	t	51ca21bd-9743-4368-b9bf-d403f4ed2548	\N	\N	\N	\N	\N	\N	1
111	60	Khách bàn 4	\N	2026-09-03 03:01:59.284	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	1
104	\N	\N	3e6f2435-e97f-4bc7-a640-e3e6412c52f9	2026-08-23 10:41:23.481	\N	\N	\N	t	t	592112a3-8595-464c-989f-b49474f51a0b	\N	\N	\N	68	\N	\N	1
11	7	\N	b02594ff-8153-4e9a-99f7-78c7c2031b6a	2026-08-04 08:51:42.43	\N	\N	\N	t	t	5359fc70-c267-4c7a-a573-a194cbaf4e5c	\N	\N	\N	75	\N	\N	1
106	\N	\N	6b94d8de-2171-4778-9ce5-c7ce11f78403	2026-08-24 02:12:33.551	\N	\N	\N	t	t	f9e43c8a-04e6-4485-b2e0-0e6c39d86272	\N	\N	\N	\N	\N	\N	1
172	102	Khách bàn 1	\N	2026-09-19 06:03:28.334	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
146	82	Khách bàn 2	\N	2026-09-15 12:46:16.678	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
174	102	Khách bàn 10	\N	2026-09-19 06:04:35.901	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
168	102	Khách bàn 2	\N	2026-09-19 05:32:46.787	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
177	104	Khách bàn 2	\N	2026-09-19 09:48:32.385	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
148	82	Khách bàn 2	\N	2026-09-15 13:25:00.297	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
150	82	Khách bàn 2	\N	2026-09-15 13:31:37.038	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
151	84	Khách bàn 1	\N	2026-09-16 03:34:55.719	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
153	85	Khách bàn 1	\N	2026-09-16 03:46:03.315	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
156	84	Khách bàn 1	\N	2026-09-16 03:50:01.504	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
157	86	Khách bàn 2	\N	2026-09-16 09:48:56.087	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
159	87	Khách bàn 1	\N	2026-09-16 12:27:34.243	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
161	89	Khách bàn 1	\N	2026-09-16 12:47:42.439	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
190	107	Khách bàn 3	\N	2026-09-19 15:14:32.28	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
192	107	Khách bàn 3	\N	2026-09-19 15:14:57.876	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
162	92	Khách bàn 1	\N	2026-09-17 12:56:54.14	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
184	107	Khách bàn 3	\N	2026-09-19 15:04:24.461	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
165	102	Khách bàn 1	\N	2026-09-19 05:24:16.075	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
164	94	Khách bàn 8	\N	2026-09-18 02:04:43.759	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
201	107	Khách bàn 3	\N	2026-09-19 15:36:28.065	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
179	106	Khách bàn 3	\N	2026-09-19 14:15:54.129	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
166	102	Khách bàn 1	\N	2026-09-19 05:24:19.574	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
170	102	Khách bàn 1	\N	2026-09-19 05:47:47.853	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
193	107	Khách bàn 3	\N	2026-09-19 15:15:01.043	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
185	107	Khách bàn 3	\N	2026-09-19 15:04:38.697	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
180	107	Khách bàn 3	\N	2026-09-19 14:17:59.419	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
182	108	Khách bàn 2	\N	2026-09-19 14:20:16.402	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
196	107	Khách bàn 3	\N	2026-09-19 15:22:11.826	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
187	107	Khách bàn 3	\N	2026-09-19 15:07:42.538	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
206	112	Khách bàn 5	\N	2026-09-20 02:48:59.921	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
198	107	Khách bàn 3	\N	2026-09-19 15:32:02.474	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
204	110	Khách bàn 1	\N	2026-09-20 01:28:22.993	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
203	\N	\N	224bb512-ee5e-4f57-a70b-c1efa3757053	2026-09-19 15:57:12.428	\N	\N	\N	t	t	cd9d5c64-cad2-4afe-80b2-4b50219f60fb	3	\N	\N	\N	\N	2026-09-22 15:57:12.423	1
80	\N	Hoàng Ngọc	\N	2026-08-11 14:53:52.12	$2b$10$oa/v.DgL424C2FZj1AQSjO0nHNHMtWDcczdjf5XdmvGYqnU7ti.LO	0987234567	vy22ngoc12@gmail.com	f	t	\N	\N	\N	\N	210	/uploads/customers/1789896923360-193895954.jpg	\N	1
208	111	Khách bàn 2	\N	2026-09-20 02:57:51.722	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
210	112	Khách bàn 5	\N	2026-09-20 02:59:12.968	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
211	112	Khách bàn 5	\N	2026-09-20 02:59:20.849	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
213	113	Khách bàn 2	\N	2026-09-20 03:50:59.795	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
214	110	Khách bàn 1	\N	2026-09-20 08:07:36.37	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
218	113	Khách bàn 2	\N	2026-09-20 10:24:55.737	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
219	113	Khách bàn 2	\N	2026-09-20 10:25:18.086	\N	\N	\N	t	t	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: dining_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.dining_sessions (id, table_id, status, "startedAt", "closedAt", ended_by, note, created_at, updated_at, reservation_id) FROM stdin;
2	7	CLOSED	2026-07-31 01:57:34.447	2026-07-31 01:57:44.506	\N	\N	2026-07-31 01:57:34.447	2026-07-31 01:57:44.507	\N
1	1	CLOSED	2026-07-28 14:31:38.797	2026-07-31 04:17:43.175	\N	\N	2026-07-28 14:31:38.797	2026-07-31 04:17:43.176	\N
7	1	CLOSED	2026-08-04 08:51:42.442	2026-08-07 03:29:45.278	\N	\N	2026-08-04 08:51:42.442	2026-08-07 03:29:45.279	\N
5	2	CLOSED	2026-08-04 08:12:09.297	2026-08-07 03:57:23.29	\N	\N	2026-08-04 08:12:09.297	2026-08-07 03:57:23.292	\N
6	3	CLOSED	2026-08-04 08:50:28.222	2026-08-07 08:47:58.901	\N	\N	2026-08-04 08:50:28.222	2026-08-07 08:47:58.903	\N
10	1	CLOSED	2026-08-07 08:49:15.986	2026-08-07 09:01:45.539	\N	\N	2026-08-07 08:49:15.986	2026-08-07 09:01:45.541	\N
11	5	CLOSED	2026-08-07 09:01:50.864	2026-08-07 09:02:02.352	\N	\N	2026-08-07 09:01:50.864	2026-08-07 09:02:02.354	\N
12	2	CLOSED	2026-08-07 09:55:36.92	2026-08-11 03:14:38.776	\N	\N	2026-08-07 09:55:36.92	2026-08-11 03:14:38.777	\N
13	8	CLOSED	2026-08-11 07:30:34.408	2026-08-11 07:55:04.422	\N	\N	2026-08-11 07:30:34.408	2026-08-11 07:55:04.423	\N
18	8	CLOSED	2026-08-11 08:04:16.316	2026-08-11 08:23:41.618	\N	\N	2026-08-11 08:04:16.316	2026-08-11 08:23:41.619	\N
19	8	CLOSED	2026-08-11 08:23:50.288	2026-08-11 08:39:33.149	\N	\N	2026-08-11 08:23:50.288	2026-08-11 08:39:33.151	\N
20	9	CLOSED	2026-08-11 09:04:45.004	2026-08-11 09:05:03.539	\N	\N	2026-08-11 09:04:45.004	2026-08-11 09:05:03.541	\N
16	1	CLOSED	2026-08-11 07:59:48.26	2026-08-11 14:27:28.757	\N	\N	2026-08-11 07:59:48.26	2026-08-11 14:27:28.759	\N
21	3	CLOSED	2026-08-13 03:53:38.682	2026-08-13 03:53:59.741	\N	\N	2026-08-13 03:53:38.682	2026-08-13 03:53:59.743	\N
22	2	CLOSED	2026-08-17 08:39:02.919	2026-08-17 09:20:45.707	\N	\N	2026-08-17 08:39:02.919	2026-08-17 09:20:45.709	\N
23	7	CLOSED	2026-08-17 09:24:45.431	2026-08-17 09:25:20.559	\N	\N	2026-08-17 09:24:45.431	2026-08-17 09:25:20.56	\N
24	2	CLOSED	2026-08-17 09:42:56.71	2026-08-17 09:46:49.237	\N	\N	2026-08-17 09:42:56.71	2026-08-17 09:46:49.239	\N
25	28	CLOSED	2026-08-17 14:15:27.216	2026-08-17 14:15:42.098	\N	\N	2026-08-17 14:15:27.216	2026-08-17 14:15:42.1	\N
26	29	CLOSED	2026-08-20 12:47:18.841	2026-08-20 12:48:45.457	\N	\N	2026-08-20 12:47:18.841	2026-08-20 12:48:45.459	\N
27	27	CLOSED	2026-08-20 12:51:45.857	2026-08-20 13:20:47.882	\N	\N	2026-08-20 12:51:45.857	2026-08-20 13:20:47.884	\N
28	27	CLOSED	2026-08-20 13:30:49.82	2026-08-20 13:57:01.873	\N	\N	2026-08-20 13:30:49.82	2026-08-20 13:57:01.874	\N
29	28	CLOSED	2026-08-20 14:03:11.538	2026-08-20 14:06:10.152	\N	\N	2026-08-20 14:03:11.538	2026-08-20 14:06:10.153	\N
30	29	CLOSED	2026-08-20 14:07:43.851	2026-08-20 14:08:27.403	\N	\N	2026-08-20 14:07:43.851	2026-08-20 14:08:27.404	\N
31	5	CLOSED	2026-08-20 14:19:02.372	2026-08-20 15:14:44.578	\N	\N	2026-08-20 14:19:02.372	2026-08-20 15:14:44.58	\N
32	2	CLOSED	2026-08-20 15:15:50.688	2026-08-20 15:20:44.33	\N	\N	2026-08-20 15:15:50.688	2026-08-20 15:20:44.332	\N
33	3	CLOSED	2026-08-20 15:22:59.181	2026-08-20 15:23:07.221	\N	\N	2026-08-20 15:22:59.181	2026-08-20 15:23:07.223	\N
34	4	CLOSED	2026-08-21 03:49:05.89	2026-08-21 03:49:21.695	\N	\N	2026-08-21 03:49:05.89	2026-08-21 03:49:21.697	\N
35	2	CLOSED	2026-08-21 12:14:49.744	2026-08-21 12:28:13.297	\N	\N	2026-08-21 12:14:49.744	2026-08-21 12:28:13.299	\N
36	27	CLOSED	2026-08-21 12:54:26.793	2026-08-21 12:56:25.436	\N	\N	2026-08-21 12:54:26.793	2026-08-21 12:56:25.438	\N
37	3	CLOSED	2026-08-23 05:04:46.882	2026-08-23 05:11:24.605	\N	\N	2026-08-23 05:04:46.882	2026-08-23 05:11:24.607	\N
38	3	CLOSED	2026-08-23 05:16:11.719	2026-08-23 05:16:36.981	\N	\N	2026-08-23 05:16:11.719	2026-08-23 05:16:36.983	\N
39	3	CLOSED	2026-08-23 05:18:01.71	2026-08-23 05:18:29.112	\N	\N	2026-08-23 05:18:01.71	2026-08-23 05:18:29.113	\N
40	3	CLOSED	2026-08-23 05:31:48.504	2026-08-23 05:32:07.428	\N	\N	2026-08-23 05:31:48.504	2026-08-23 05:32:07.429	\N
42	4	CLOSED	2026-08-23 06:01:27.466	2026-08-23 06:06:50.895	\N	\N	2026-08-23 06:01:27.466	2026-08-23 06:06:50.896	\N
41	3	CLOSED	2026-08-23 05:32:22.902	2026-08-23 06:09:40.032	\N	\N	2026-08-23 05:32:22.902	2026-08-23 06:09:40.033	\N
43	3	CLOSED	2026-08-23 08:18:28.211	2026-08-23 08:43:04.516	\N	\N	2026-08-23 08:18:28.211	2026-08-23 08:43:04.517	\N
44	3	CLOSED	2026-08-23 08:50:09.534	2026-08-23 08:50:29.002	\N	\N	2026-08-23 08:50:09.534	2026-08-23 08:50:29.005	\N
45	3	CLOSED	2026-08-23 08:50:41.163	2026-08-23 09:21:45.64	\N	\N	2026-08-23 08:50:41.163	2026-08-23 09:21:45.642	\N
47	27	CLOSED	2026-08-23 09:28:36.155	2026-08-23 09:38:59.124	\N	\N	2026-08-23 09:28:36.155	2026-08-23 09:38:59.127	\N
48	27	CLOSED	2026-08-23 10:40:27.065	2026-08-23 10:42:30.925	\N	\N	2026-08-23 10:40:27.065	2026-08-23 10:42:30.926	\N
49	27	CLOSED	2026-08-23 14:21:20.006	2026-08-23 14:21:45.69	\N	\N	2026-08-23 14:21:20.006	2026-08-23 14:21:45.692	\N
50	27	CLOSED	2026-08-23 14:55:26.501	2026-08-23 14:57:20.312	\N	\N	2026-08-23 14:55:26.501	2026-08-23 14:57:20.313	\N
52	29	CLOSED	2026-08-23 15:07:47.247	2026-08-23 15:08:12.083	\N	\N	2026-08-23 15:07:47.247	2026-08-23 15:08:12.084	\N
51	27	CLOSED	2026-08-23 15:00:52.966	2026-08-23 15:19:11.152	\N	\N	2026-08-23 15:00:52.966	2026-08-23 15:19:11.153	\N
53	27	CLOSED	2026-08-23 15:19:19.957	2026-08-23 15:29:44.934	\N	\N	2026-08-23 15:19:19.957	2026-08-23 15:29:44.935	\N
54	27	CLOSED	2026-08-23 15:31:35.366	2026-08-23 15:36:34.593	\N	\N	2026-08-23 15:31:35.366	2026-08-23 15:36:34.595	\N
55	5	CLOSED	2026-08-24 03:31:37.479	2026-08-24 03:46:50.606	\N	\N	2026-08-24 03:31:37.479	2026-08-24 03:46:50.608	\N
56	7	CLOSED	2026-08-24 05:01:42.977	2026-08-24 05:01:55.73	\N	\N	2026-08-24 05:01:42.977	2026-08-24 05:01:55.731	\N
57	2	CLOSED	2026-08-24 07:46:51.275	2026-08-24 07:47:31.425	\N	\N	2026-08-24 07:46:51.275	2026-08-24 07:47:31.427	\N
58	5	CLOSED	2026-08-25 04:28:43.505	2026-08-25 09:22:26.189	\N	\N	2026-08-25 04:28:43.505	2026-08-25 09:22:26.191	\N
59	5	CLOSED	2026-08-25 09:24:52.11	2026-08-25 09:26:02.773	\N	\N	2026-08-25 09:24:52.11	2026-08-25 09:26:02.775	\N
60	4	CLOSED	2026-09-03 03:01:59.221	2026-09-03 08:03:30.057	\N	\N	2026-09-03 03:01:59.221	2026-09-03 08:03:30.059	\N
61	5	CLOSED	2026-09-03 08:07:42.864	2026-09-03 08:07:57.097	\N	\N	2026-09-03 08:07:42.864	2026-09-03 08:07:57.099	\N
62	5	CLOSED	2026-09-03 08:46:55.722	2026-09-03 08:47:09.164	\N	\N	2026-09-03 08:46:55.722	2026-09-03 08:47:09.166	\N
63	7	CLOSED	2026-09-03 08:52:14.517	2026-09-03 08:52:41.112	\N	\N	2026-09-03 08:52:14.517	2026-09-03 08:52:41.114	\N
64	1	CLOSED	2026-09-03 08:55:25.268	2026-09-03 08:55:45.142	\N	\N	2026-09-03 08:55:25.268	2026-09-03 08:55:45.144	\N
65	8	CLOSED	2026-09-03 08:57:22.526	2026-09-03 08:57:40.573	\N	\N	2026-09-03 08:57:22.526	2026-09-03 08:57:40.575	\N
66	7	CLOSED	2026-09-03 09:01:13.978	2026-09-03 09:01:38.253	\N	\N	2026-09-03 09:01:13.978	2026-09-03 09:01:38.254	\N
67	5	CLOSED	2026-09-07 12:10:53.745	2026-09-07 14:36:20.339	\N	\N	2026-09-07 12:10:53.745	2026-09-07 14:36:20.34	\N
70	1	CLOSED	2026-09-07 15:09:42.316	2026-09-07 15:19:15.842	\N	\N	2026-09-07 15:09:42.316	2026-09-07 15:19:15.844	\N
68	7	CLOSED	2026-09-07 14:43:23.998	2026-09-08 01:48:29.672	\N	\N	2026-09-07 14:43:23.998	2026-09-08 01:48:29.674	\N
46	3	CLOSED	2026-08-23 09:28:03.345	2026-09-08 01:48:37.126	\N	\N	2026-08-23 09:28:03.345	2026-09-08 01:48:37.128	\N
69	5	CLOSED	2026-09-07 15:00:31.12	2026-09-08 01:48:42.739	\N	\N	2026-09-07 15:00:31.12	2026-09-08 01:48:42.741	\N
72	6	CLOSED	2026-09-07 15:19:52.224	2026-09-08 01:48:49.486	\N	\N	2026-09-07 15:19:52.224	2026-09-08 01:48:49.488	\N
71	8	CLOSED	2026-09-07 15:19:20.354	2026-09-08 01:48:58.408	\N	\N	2026-09-07 15:19:20.354	2026-09-08 01:48:58.409	\N
74	9	CLOSED	2026-09-07 15:30:39.824	2026-09-08 01:49:05.153	\N	\N	2026-09-07 15:30:39.824	2026-09-08 01:49:05.155	\N
73	1	CLOSED	2026-09-07 15:21:21.099	2026-09-08 01:49:13.579	\N	\N	2026-09-07 15:21:21.099	2026-09-08 01:49:13.581	\N
76	6	CLOSED	2026-09-08 02:36:50.212	2026-09-08 04:31:54.015	\N	\N	2026-09-08 02:36:50.212	2026-09-08 04:31:54.017	\N
75	4	CLOSED	2026-09-08 02:35:03.611	2026-09-08 04:32:00.028	\N	\N	2026-09-08 02:35:03.611	2026-09-08 04:32:00.03	\N
77	7	CLOSED	2026-09-10 02:42:55.11	2026-09-10 02:51:31.484	\N	\N	2026-09-10 02:42:55.11	2026-09-10 02:51:31.486	\N
79	2	CLOSED	2026-09-10 02:59:26.374	2026-09-15 09:43:03.463	\N	\N	2026-09-10 02:59:26.374	2026-09-15 09:43:03.465	\N
80	3	CLOSED	2026-09-15 11:15:19.383	2026-09-15 11:19:02.156	\N	\N	2026-09-15 11:15:19.383	2026-09-15 11:19:02.158	\N
81	3	CLOSED	2026-09-15 11:19:05.01	2026-09-15 11:26:55.386	\N	\N	2026-09-15 11:19:05.01	2026-09-15 11:26:55.387	\N
82	2	CLOSED	2026-09-15 12:46:16.673	2026-09-15 13:31:52.571	\N	\N	2026-09-15 12:46:16.673	2026-09-15 13:31:52.572	\N
83	3	CLOSED	2026-09-15 12:54:16.522	2026-09-15 13:32:03.137	\N	\N	2026-09-15 12:54:16.522	2026-09-15 13:32:03.138	\N
78	7	CLOSED	2026-09-10 02:51:40.612	2026-09-16 03:39:41.078	\N	\N	2026-09-10 02:51:40.612	2026-09-16 03:39:41.079	\N
84	32	CLOSED	2026-09-16 03:34:55.705	2026-09-16 09:45:21.933	\N	\N	2026-09-16 03:34:55.705	2026-09-16 09:45:21.936	\N
85	7	CLOSED	2026-09-16 03:46:03.309	2026-09-16 09:48:46.774	\N	\N	2026-09-16 03:46:03.309	2026-09-16 09:48:46.777	\N
86	2	CLOSED	2026-09-16 09:48:56.078	2026-09-16 09:49:05.628	\N	\N	2026-09-16 09:48:56.078	2026-09-16 09:49:05.63	\N
88	7	CLOSED	2026-09-16 12:30:24.837	2026-09-16 12:37:46.776	\N	\N	2026-09-16 12:30:24.837	2026-09-16 12:37:46.778	\N
87	32	CLOSED	2026-09-16 09:54:43.166	2026-09-16 12:46:56.886	\N	\N	2026-09-16 09:54:43.166	2026-09-16 12:46:56.887	\N
90	3	CLOSED	2026-09-16 14:16:16.692	2026-09-16 14:16:43.737	\N	\N	2026-09-16 14:16:16.692	2026-09-16 14:16:43.739	\N
92	3	CLOSED	2026-09-17 13:17:00.122	2026-09-17 13:17:37.516	\N	\N	2026-09-17 13:17:00.122	2026-09-17 13:17:37.518	\N
91	2	CLOSED	2026-09-17 12:56:54.112	2026-09-17 13:17:20.548	\N	\N	2026-09-17 12:56:54.112	2026-09-17 13:17:20.55	\N
93	3	CLOSED	2026-09-18 02:04:09.165	2026-09-18 02:04:38.974	\N	\N	2026-09-18 02:04:09.165	2026-09-18 02:04:38.976	\N
94	8	CLOSED	2026-09-18 02:04:43.748	2026-09-18 02:17:02.796	\N	\N	2026-09-18 02:04:43.748	2026-09-18 02:17:02.797	\N
95	3	CLOSED	2026-09-18 02:43:20.218	2026-09-18 02:46:30.579	\N	\N	2026-09-18 02:43:20.218	2026-09-18 02:46:30.581	\N
96	3	CLOSED	2026-09-18 02:46:39.869	2026-09-18 02:54:36.042	\N	\N	2026-09-18 02:46:39.869	2026-09-18 02:54:36.043	\N
97	3	CLOSED	2026-09-18 03:12:30.755	2026-09-18 03:16:18.621	\N	\N	2026-09-18 03:12:30.755	2026-09-18 03:16:18.623	\N
98	3	CLOSED	2026-09-18 03:16:34.247	2026-09-18 03:20:29.092	\N	\N	2026-09-18 03:16:34.247	2026-09-18 03:20:29.094	\N
89	32	CLOSED	2026-09-16 12:47:42.427	2026-09-20 02:45:11.405	\N	\N	2026-09-16 12:47:42.427	2026-09-20 02:45:11.407	\N
99	3	CLOSED	2026-09-18 03:20:43.282	2026-09-18 03:24:37.419	\N	\N	2026-09-18 03:20:43.282	2026-09-18 03:24:37.421	\N
100	3	CLOSED	2026-09-18 03:24:48.604	2026-09-18 03:25:03.048	\N	\N	2026-09-18 03:24:48.604	2026-09-18 03:25:03.049	\N
103	2	CLOSED	2026-09-19 05:32:46.781	2026-09-19 06:09:06.36	\N	\N	2026-09-19 05:32:46.781	2026-09-19 06:09:06.362	\N
102	1	CLOSED	2026-09-19 05:24:16.011	2026-09-19 06:27:37.479	\N	\N	2026-09-19 05:24:16.011	2026-09-19 06:27:37.481	\N
105	2	CLOSED	2026-09-19 13:50:35.64	2026-09-19 13:50:44.123	\N	\N	2026-09-19 13:50:35.64	2026-09-19 13:50:44.125	\N
104	7	CLOSED	2026-09-19 09:48:32.357	2026-09-19 13:51:02.513	\N	\N	2026-09-19 09:48:32.357	2026-09-19 13:51:02.514	\N
101	3	CLOSED	2026-09-18 06:58:54.726	2026-09-19 14:14:14.806	\N	\N	2026-09-18 06:58:54.726	2026-09-19 14:14:14.808	\N
106	3	CLOSED	2026-09-19 14:15:54.122	2026-09-19 14:17:57.365	\N	\N	2026-09-19 14:15:54.122	2026-09-19 14:17:57.366	\N
108	1	CLOSED	2026-09-19 14:20:16.39	2026-09-19 14:20:39.875	\N	\N	2026-09-19 14:20:16.39	2026-09-19 14:20:39.876	\N
109	2	CLOSED	2026-09-19 14:53:35.123	2026-09-19 15:01:41.655	\N	\N	2026-09-19 14:53:35.123	2026-09-19 15:01:41.657	\N
111	2	CLOSED	2026-09-20 01:38:57.015	2026-09-20 02:58:33.418	\N	\N	2026-09-20 01:38:57.015	2026-09-20 02:58:33.42	\N
107	3	CLOSED	2026-09-19 14:17:59.41	2026-09-20 02:59:02.28	\N	\N	2026-09-19 14:17:59.41	2026-09-20 02:59:02.282	\N
112	5	CLOSED	2026-09-20 02:48:59.908	2026-09-20 02:59:38.301	\N	\N	2026-09-20 02:48:59.908	2026-09-20 02:59:38.303	\N
110	7	CLOSED	2026-09-20 01:28:22.877	2026-09-20 09:09:24.775	\N	\N	2026-09-20 01:28:22.877	2026-09-20 09:09:24.776	\N
115	5	ACTIVE	2026-09-20 10:24:47.936	\N	\N	\N	2026-09-20 10:24:47.936	2026-09-20 10:24:47.936	\N
114	3	CLOSED	2026-09-20 10:19:19.725	2026-09-20 10:25:29.729	\N	\N	2026-09-20 10:19:19.725	2026-09-20 10:25:29.731	\N
113	7	CLOSED	2026-09-20 03:45:28.057	2026-09-20 10:26:07.625	\N	\N	2026-09-20 03:45:28.057	2026-09-20 10:26:07.627	\N
116	32	CLOSED	2026-09-22 13:55:54.266	2026-09-22 13:56:05.161	\N	\N	2026-09-22 13:55:54.266	2026-09-22 13:56:05.162	\N
118	7	CLOSED	2026-09-22 14:03:24.018	2026-09-22 14:03:34.343	\N	\N	2026-09-22 14:03:24.018	2026-09-22 14:03:34.345	\N
117	32	CLOSED	2026-09-22 14:02:30.714	2026-09-22 14:05:16.402	\N	\N	2026-09-22 14:02:30.714	2026-09-22 14:05:16.404	\N
119	32	CLOSED	2026-09-22 14:05:19.741	2026-09-22 14:05:26.74	\N	\N	2026-09-22 14:05:19.741	2026-09-22 14:05:26.742	\N
120	2	CLOSED	2026-09-22 14:23:07.485	2026-09-22 14:23:21.358	\N	\N	2026-09-22 14:23:07.485	2026-09-22 14:23:21.359	\N
121	32	CLOSED	2026-09-22 14:45:05.41	2026-09-22 14:48:10.499	\N	\N	2026-09-22 14:45:05.41	2026-09-22 14:48:10.502	\N
\.


--
-- Data for Name: email_change_otps; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.email_change_otps (id, user_id, new_email, otp, expires_at, created_at) FROM stdin;
\.


--
-- Data for Name: floors; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.floors (id, branch_id, floor_number, name, created_at) FROM stdin;
1	1	1	Tầng 1	2026-07-28 14:31:38.327
2	1	2	Tầng 2	2026-07-28 14:31:38.338
4	3	1	Tầng 1	2026-08-10 04:27:22.585
5	3	2	Tầng 2	2026-08-10 04:27:38.894
6	4	1	Tầng 1	2026-08-24 07:41:35.935
\.


--
-- Data for Name: foods; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.foods (id, category_id, name, price, description, image, created_at, updated_at, restaurant_id) FROM stdin;
15	4	Trà Đào	35000.00	Trà đào cam sả	/foods/tra-dao.jpg	2026-07-28 14:31:38.668	2026-09-16 09:38:03.43	1
5	2	Cơm gà	55000.00	Cơm gà xối mỡ	/foods/com-ga.jpg	2026-07-28 14:31:38.632	2026-09-16 09:38:12.266	1
11	3	Lẩu Hải Sản	399000.00	Lẩu hải sản	/foods/lau-haisan.jpg	2026-07-28 14:31:38.654	2026-09-16 09:38:49.864	1
4	1	Bún thịt nướng	58000.00	Bún thịt nướng	/foods/bun-thit-nuong.jpg	2026-07-28 14:31:38.628	2026-07-28 14:31:38.628	1
6	2	Cơm sườn	60000.00	Cơm sườn nướng	/foods/com-suon.jpg	2026-07-28 14:31:38.637	2026-07-28 14:31:38.637	1
7	2	Cơm bò lúc lắc	75000.00	Cơm bò lúc lắc	/foods/com-bo.jpg	2026-07-28 14:31:38.64	2026-07-28 14:31:38.64	1
8	2	Cơm cá kho	65000.00	Cơm cá kho tộ	/foods/com-ca.jpg	2026-07-28 14:31:38.643	2026-07-28 14:31:38.643	1
9	3	Lẩu Thái	299000.00	Lẩu Thái chua cay	/foods/lau-thai.jpg	2026-07-28 14:31:38.647	2026-07-28 14:31:38.647	1
10	3	Lẩu Kim Chi	329000.00	Lẩu Kim Chi	/foods/lau-kimchi.jpg	2026-07-28 14:31:38.651	2026-07-28 14:31:38.651	1
12	3	Lẩu Bò	359000.00	Lẩu bò	/foods/lau-bo.jpg	2026-07-28 14:31:38.657	2026-07-28 14:31:38.657	1
13	4	Coca Cola	18000.00	Nước ngọt Coca Cola	/foods/coca.jpg	2026-07-28 14:31:38.661	2026-07-28 14:31:38.661	1
14	4	Pepsi	18000.00	Nước ngọt Pepsi	/foods/pepsi.jpg	2026-07-28 14:31:38.665	2026-07-28 14:31:38.665	1
16	4	Trà Chanh	25000.00	Trà chanh	/foods/tra-chanh.jpg	2026-07-28 14:31:38.671	2026-07-28 14:31:38.671	1
18	5	Kem Vanilla	30000.00	Kem Vanilla	/foods/kem.jpg	2026-07-28 14:31:38.677	2026-07-28 14:31:38.677	1
19	5	Chè Khúc Bạch	35000.00	Chè khúc bạch	/foods/che.jpg	2026-07-28 14:31:38.681	2026-07-28 14:31:38.681	1
20	5	Trái cây	45000.00	Đĩa trái cây	/foods/fruit.jpg	2026-07-28 14:31:38.684	2026-07-28 14:31:38.684	1
21	1	Bún sườn	30000.00		/uploads/foods/1789483892066-602839401.webp	2026-09-15 14:54:58.62	2026-09-15 14:54:58.62	1
3	1	Bún chả	60000.00	Bún chả Hà Nội	/uploads/foods/1787557349774-794253235.jfif	2026-07-28 14:31:38.625	2026-09-16 09:24:35.929	1
2	1	Bún riêu	50000.00	Bún riêu cua	/uploads/foods/1787108614280-755003035.jpg	2026-07-28 14:31:38.619	2026-09-16 09:38:18.18	1
1	1	Bún bò Huế	55000.00	Bún bò Huế truyền thống	/uploads/foods/1787105209666-262663907.webp	2026-07-28 14:31:38.609	2026-09-16 09:38:33.316	1
22	8	Gỏi cuốn	35000.00	\N	/uploads/foods/1789701973253-400639825.jfif	2026-09-15 15:01:19.266	2026-09-18 03:26:19.869	2
17	5	Bánh Flan	25000.00	Bánh flan caramel	/uploads/foods/1785290485040-89288084.webp	2026-07-28 14:31:38.674	2026-09-19 13:51:48.597	1
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_items (id, order_id, food_id, quantity, status, price, note, kitchen_completed_at, kitchen_ready_at, kitchen_sent_at, kitchen_status, created_at) FROM stdin;
1	1	5	2	SERVED	55000.00	Ít cơm	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
46	24	2	1	SERVED	50000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
3	2	5	1	SERVED	55000.00		\N	\N	\N	WAITING	2026-09-07 21:58:56.254
4	2	13	2	SERVED	18000.00		\N	\N	\N	WAITING	2026-09-07 21:58:56.254
103	51	6	1	SERVED	60000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
104	51	5	1	SERVED	55000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
76	45	16	1	CANCELLED	25000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
47	25	3	1	SERVED	60000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
48	26	5	1	CONFIRMED	55000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
6	3	2	1	SERVED	50000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
7	4	19	1	CONFIRMED	35000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
49	27	18	1	CONFIRMED	30000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
50	27	6	1	CONFIRMED	60000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
5	2	3	1	SERVED	60000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
51	28	10	1	CONFIRMED	329000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
2	1	13	1	SERVED	18000.00	Không đá	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
8	5	8	1	CONFIRMED	65000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
9	5	13	1	CONFIRMED	18000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
10	5	19	1	CONFIRMED	35000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
52	29	16	1	CONFIRMED	25000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
28	18	2	1	SERVED	50000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
29	18	19	1	SERVED	35000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
30	18	13	1	SERVED	18000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
53	29	7	1	CONFIRMED	75000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
54	30	6	1	CONFIRMED	60000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
11	8	14	1	SERVED	18000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
12	8	9	1	SERVED	299000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
75	45	19	1	CANCELLED	35000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
31	18	7	1	SERVED	75000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
40	22	20	1	SERVED	45000.00	\N	\N	\N	\N	PREPARING	2026-09-07 21:58:56.254
77	45	19	1	CANCELLED	35000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
32	19	2	1	SERVED	50000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
13	9	7	1	SERVED	75000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
14	9	19	1	SERVED	35000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
27	16	2	1	SERVED	50000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
15	6	4	1	SERVED	58000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
55	31	2	1	SERVED	50000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
56	31	17	1	SERVED	25000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
57	32	19	1	CONFIRMED	35000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
33	20	12	1	SERVED	359000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
58	32	13	1	CONFIRMED	18000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
78	45	4	1	SERVED	58000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
16	7	7	1	SERVED	75000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
17	7	2	1	SERVED	50000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
105	52	1	1	SERVED	55000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
18	10	7	1	SERVED	75000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
106	52	2	1	SERVED	50000.00	không hành	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
59	33	2	1	SERVED	50000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
60	33	1	1	SERVED	55000.00	không hành	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
34	21	2	1	SERVED	50000.00	nhiều ớt	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
35	21	7	1	SERVED	75000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
19	11	4	1	SERVED	58000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
20	11	16	1	SERVED	25000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
36	21	13	2	SERVED	18000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
61	34	8	1	CONFIRMED	65000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
62	35	2	1	CONFIRMED	50000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
21	12	4	1	SERVED	58000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
63	36	2	1	SERVED	50000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
107	53	4	1	SERVED	58000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
37	22	2	1	SERVED	50000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
38	22	3	1	SERVED	60000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
39	22	13	1	SERVED	18000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
108	53	7	1	SERVED	75000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
22	13	14	1	SERVED	18000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
23	13	12	1	SERVED	359000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
24	13	16	1	SERVED	25000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
25	13	2	1	SERVED	50000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
26	13	13	1	SERVED	18000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
86	45	4	1	CANCELLED	58000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
109	53	7	1	SERVED	75000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
110	54	4	1	SERVED	58000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
111	54	13	1	SERVED	18000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
41	23	19	1	SERVED	35000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
42	23	8	1	SERVED	65000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
43	23	4	1	SERVED	58000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
44	23	2	1	SERVED	50000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
45	23	14	1	SERVED	18000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
112	55	7	1	SERVED	75000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
79	45	3	1	SERVED	60000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
80	45	13	1	SERVED	18000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
81	45	6	1	SERVED	60000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
82	45	5	1	SERVED	55000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
83	45	8	1	SERVED	65000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
84	45	19	1	SERVED	35000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
64	40	19	1	SERVED	35000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
65	40	18	1	SERVED	30000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
66	40	1	1	SERVED	55000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
69	40	11	1	SERVED	399000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
67	40	19	1	SERVED	35000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
68	40	4	1	SERVED	58000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
85	45	2	1	SERVED	50000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
87	45	2	1	SERVED	50000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
88	45	7	1	SERVED	75000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
89	45	14	1	SERVED	18000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
113	55	5	1	SERVED	55000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
90	45	8	1	SERVED	65000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
91	46	2	1	CONFIRMED	50000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
114	56	19	1	SERVED	35000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
92	47	4	1	CANCELLED	58000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
72	43	18	1	SERVED	30000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
71	43	16	1	SERVED	25000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
70	43	6	1	SERVED	60000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
93	47	2	1	SERVED	50000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
73	44	1	1	SERVED	55000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
74	44	4	1	SERVED	58000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
119	59	13	1	SERVED	18000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
116	58	5	1	SERVED	55000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
117	58	4	1	SERVED	58000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
118	58	19	1	SERVED	35000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
115	57	5	1	SERVED	55000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
94	47	13	1	SERVED	18000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
95	47	14	1	SERVED	18000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
96	47	16	1	SERVED	25000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
97	47	20	1	SERVED	45000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
98	47	18	1	SERVED	30000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
99	47	19	1	SERVED	35000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
100	48	2	1	SERVED	50000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
101	49	7	1	CONFIRMED	75000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
120	60	6	1	SERVED	60000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
102	50	19	1	SERVED	35000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
121	61	18	1	SERVED	30000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
122	61	20	1	SERVED	45000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
124	63	5	1	SERVED	55000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
123	62	8	1	SERVED	65000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
125	62	5	1	SERVED	55000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
126	64	8	1	PENDING	65000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
127	65	1	1	SERVED	55000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
128	66	2	1	SERVED	50000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
129	67	1	1	SERVED	55000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
186	106	6	1	CONFIRMED	60000.00	\N	2026-09-08 02:19:23.385	\N	2026-09-08 02:06:00.121	COMPLETED	2026-09-08 02:06:00.133
134	69	2	1	SERVED	50000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
131	68	1	1	SERVED	55000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
221	139	1	1	SERVED	55000.00	\N	\N	\N	2026-09-16 03:39:36.461	WAITING	2026-09-16 03:39:35.162
136	71	1	1	SERVED	55000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
223	142	21	1	CONFIRMED	30000.00	\N	\N	\N	2026-09-16 03:53:04.322	WAITING	2026-09-16 03:53:04.325
165	88	13	1	SERVED	18000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
166	88	7	1	SERVED	75000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
138	72	8	1	SERVED	65000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
168	90	7	1	CONFIRMED	75000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
142	72	11	1	SERVED	399000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
170	92	8	1	SERVED	65000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
188	108	13	1	CONFIRMED	18000.00	\N	2026-09-08 02:44:28.83	\N	2026-09-08 02:27:27.066	COMPLETED	2026-09-08 02:27:27.073
189	108	8	1	CONFIRMED	65000.00	\N	2026-09-08 02:44:28.83	\N	2026-09-08 02:27:27.066	COMPLETED	2026-09-08 02:27:27.073
240	157	3	1	CANCELLED	60000.00	\N	\N	\N	2026-09-18 03:12:40.678	WAITING	2026-09-18 03:12:30.837
143	74	19	1	SERVED	35000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
145	74	1	1	SERVED	55000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
174	96	4	1	SERVED	58000.00	\N	2026-09-07 14:13:52.762	\N	2026-09-07 14:10:46.618	COMPLETED	2026-09-07 21:58:56.254
224	141	22	1	SERVED	35000.00	\N	\N	\N	2026-09-16 09:45:16.943	WAITING	2026-09-16 09:45:15.88
149	75	20	1	SERVED	45000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
193	112	4	1	CONFIRMED	58000.00	\N	2026-09-08 04:01:49.693	\N	2026-09-08 04:01:39.584	COMPLETED	2026-09-08 04:01:39.592
191	110	2	1	SERVED	50000.00	Không hành	2026-09-08 02:44:30.705	\N	2026-09-08 02:37:05.808	COMPLETED	2026-09-08 02:37:05.149
241	157	2	1	SERVED	50000.00	\N	\N	\N	2026-09-18 03:12:40.678	WAITING	2026-09-18 03:12:30.862
194	113	4	1	CANCELLED	58000.00	\N	\N	\N	\N	WAITING	2026-09-10 02:43:13.297
196	115	4	1	CANCELLED	58000.00	\N	\N	\N	\N	WAITING	2026-09-10 02:45:52.55
151	76	7	1	SERVED	75000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
153	76	13	1	SERVED	18000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
198	117	7	1	CANCELLED	75000.00	\N	\N	\N	\N	WAITING	2026-09-10 02:51:45.632
243	159	21	1	SERVED	30000.00	\N	\N	\N	2026-09-18 03:24:34.187	WAITING	2026-09-18 03:20:43.321
155	78	19	1	SERVED	35000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
200	119	7	1	CANCELLED	75000.00	\N	\N	\N	2026-09-10 02:59:40.044	WAITING	2026-09-10 02:59:39.399
159	82	4	1	SERVED	58000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
163	86	3	1	SERVED	60000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
230	149	22	1	SERVED	35000.00	\N	2026-09-16 12:47:57.16	\N	2026-09-16 12:47:49.944	COMPLETED	2026-09-16 12:47:46.402
226	145	22	1	CONFIRMED	35000.00	\N	\N	\N	2026-09-16 09:54:49.978	WAITING	2026-09-16 09:54:49.982
228	146	22	1	SERVED	35000.00	\N	\N	\N	2026-09-16 12:46:50.514	WAITING	2026-09-16 12:37:55.696
176	97	5	1	SERVED	55000.00	\N	2026-09-07 15:10:08.507	\N	2026-09-07 14:50:35.739	COMPLETED	2026-09-07 21:58:56.254
178	99	7	1	SERVED	75000.00	\N	2026-09-07 15:10:07.192	\N	2026-09-07 15:04:16.449	COMPLETED	2026-09-07 15:04:13.557
180	101	8	1	SERVED	65000.00	\N	2026-09-07 15:32:40.303	\N	2026-09-07 15:19:25.422	COMPLETED	2026-09-07 15:19:24.439
184	104	13	1	SERVED	18000.00	\N	2026-09-07 15:32:45.583	\N	2026-09-07 15:30:44.891	COMPLETED	2026-09-07 15:30:43.861
182	103	16	1	SERVED	25000.00	\N	2026-09-07 15:32:43.006	\N	2026-09-07 15:21:38.637	COMPLETED	2026-09-07 15:21:27.692
251	169	2	1	CANCELLED	50000.00	\N	\N	\N	2026-09-19 06:17:12.274	WAITING	2026-09-19 06:04:27.676
203	123	2	1	SERVED	50000.00	\N	2026-09-15 09:38:07.99	\N	2026-09-15 09:25:12.173	COMPLETED	2026-09-15 09:25:10.267
206	123	5	1	SERVED	55000.00	\N	2026-09-15 09:38:07.99	\N	2026-09-15 09:30:47.99	COMPLETED	2026-09-15 09:30:47.009
253	169	1	1	CANCELLED	55000.00	\N	\N	\N	2026-09-19 06:17:12.274	WAITING	2026-09-19 06:04:38.482
209	126	2	1	CONFIRMED	50000.00	\N	2026-09-15 10:03:23.426	\N	2026-09-15 09:50:51.73	COMPLETED	2026-09-15 09:50:51.731
211	128	13	1	CONFIRMED	18000.00	\N	2026-09-15 10:03:24.117	\N	2026-09-15 10:02:39.611	COMPLETED	2026-09-15 10:02:39.614
255	169	2	1	CANCELLED	50000.00	\N	\N	\N	2026-09-19 06:17:12.274	WAITING	2026-09-19 06:11:51.356
311	212	3	1	SERVED	60000.00	\N	\N	\N	2026-09-20 02:58:23.596	WAITING	2026-09-20 02:58:13.78
264	175	3	1	SERVED	60000.00	\N	\N	\N	2026-09-19 14:14:01.132	WAITING	2026-09-19 14:12:09.747
213	130	19	1	SERVED	35000.00	\N	2026-09-15 11:26:06.266	\N	2026-09-15 11:19:08.775	COMPLETED	2026-09-15 11:19:07.657
306	210	21	1	SERVED	30000.00	\N	\N	\N	2026-09-20 01:42:37.14	WAITING	2026-09-20 01:40:37.603
257	172	3	1	SERVED	60000.00	\N	2026-09-19 06:27:26.809	\N	2026-09-19 06:27:10.846	COMPLETED	2026-09-19 06:21:23.522
308	210	4	3	SERVED	58000.00	\N	\N	\N	2026-09-20 01:42:37.14	WAITING	2026-09-20 01:42:30.96
309	210	8	1	SERVED	65000.00	\N	\N	\N	2026-09-20 01:42:37.14	WAITING	2026-09-20 01:42:30.979
259	174	3	1	SERVED	60000.00	\N	\N	\N	2026-09-19 13:50:57.738	WAITING	2026-09-19 13:50:38.99
261	175	3	1	SERVED	60000.00	\N	\N	\N	2026-09-19 14:03:20.099	WAITING	2026-09-19 14:03:06.84
215	132	1	1	SERVED	55000.00	\N	2026-09-15 13:18:58.483	\N	2026-09-15 12:54:51.99	COMPLETED	2026-09-15 12:54:16.577
316	217	2	1	SERVED	50000.00	\N	\N	\N	2026-09-20 09:00:52.295	WAITING	2026-09-20 08:07:39.355
262	175	2	1	SERVED	50000.00	\N	\N	\N	2026-09-19 14:07:22.095	WAITING	2026-09-19 14:04:22.494
232	152	21	1	SERVED	30000.00	\N	\N	\N	2026-09-17 13:17:11.227	WAITING	2026-09-17 12:56:57.041
266	177	21	1	SERVED	30000.00	\N	\N	\N	2026-09-19 14:17:26.335	WAITING	2026-09-19 14:17:18.024
234	153	3	1	SERVED	60000.00	\N	\N	\N	2026-09-18 02:04:23.094	WAITING	2026-09-18 02:04:09.271
323	223	21	1	SERVED	30000.00	\N	\N	\N	2026-09-22 13:56:00.316	WAITING	2026-09-22 13:55:58.876
236	155	3	1	SERVED	60000.00	\N	\N	\N	2026-09-18 02:46:27.008	WAITING	2026-09-18 02:43:20.281
237	155	2	1	SERVED	50000.00	\N	\N	\N	2026-09-18 02:46:27.008	WAITING	2026-09-18 02:43:20.289
326	226	13	1	SERVED	18000.00	\N	\N	\N	2026-09-22 14:05:00.35	WAITING	2026-09-22 14:04:59.307
328	228	4	1	SERVED	58000.00	\N	\N	\N	2026-09-22 14:05:22.99	WAITING	2026-09-22 14:05:22.225
329	229	3	1	SERVED	60000.00	\N	\N	\N	2026-09-22 14:23:17.325	WAITING	2026-09-22 14:23:14.786
331	232	22	1	CONFIRMED	35000.00	\N	\N	\N	2026-09-22 14:48:16.057	WAITING	2026-09-22 14:48:16.077
187	107	2	1	CONFIRMED	50000.00	\N	2026-09-08 02:19:24.175	\N	2026-09-08 02:09:39.958	COMPLETED	2026-09-08 02:09:39.963
135	70	7	1	SERVED	75000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
167	89	2	1	SERVED	50000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
242	158	3	1	SERVED	60000.00	\N	\N	\N	2026-09-18 03:18:07.516	WAITING	2026-09-18 03:16:34.282
130	68	2	1	SERVED	50000.00	nhiều ớt	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
133	68	7	1	SERVED	75000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
212	129	1	1	SERVED	55000.00	\N	2026-09-15 11:18:57.456	\N	2026-09-15 11:18:51.544	COMPLETED	2026-09-15 11:15:19.457
137	72	13	1	SERVED	18000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
132	67	19	1	SERVED	35000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
169	91	12	1	SERVED	359000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
192	111	3	1	CONFIRMED	60000.00	\N	2026-09-08 02:44:32.609	\N	2026-09-08 02:44:07.324	COMPLETED	2026-09-08 02:44:07.334
171	93	2	1	SERVED	50000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
190	109	2	1	SERVED	50000.00	\N	2026-09-08 02:44:29.982	\N	2026-09-08 02:35:08.606	COMPLETED	2026-09-08 02:35:07.595
140	73	1	1	SERVED	55000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
141	73	9	1	SERVED	299000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
244	160	4	1	SERVED	58000.00	\N	\N	\N	2026-09-18 03:25:00.11	WAITING	2026-09-18 03:24:48.663
139	72	6	1	SERVED	60000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
195	114	2	1	CANCELLED	50000.00	\N	\N	\N	2026-09-10 02:43:42.412	WAITING	2026-09-10 02:43:41.16
144	74	16	1	SERVED	25000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
307	210	2	1	SERVED	50000.00	\N	\N	\N	2026-09-20 01:42:37.14	WAITING	2026-09-20 01:41:48.517
216	133	19	1	CONFIRMED	35000.00	\N	2026-09-15 13:18:59.256	\N	2026-09-15 13:17:10.963	COMPLETED	2026-09-15 13:17:10.966
197	116	2	1	SERVED	50000.00	\N	2026-09-10 02:51:18.067	\N	2026-09-10 02:50:52.177	COMPLETED	2026-09-10 02:48:41.878
175	96	7	1	SERVED	75000.00	\N	2026-09-07 14:35:45.054	\N	2026-09-07 14:31:59.507	COMPLETED	2026-09-07 21:58:56.254
173	95	3	1	SERVED	60000.00	\N	2026-09-07 14:35:44.13	\N	2026-09-07 14:28:45.773	COMPLETED	2026-09-07 21:58:56.254
146	75	14	1	SERVED	18000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
147	75	15	1	SERVED	35000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
148	75	2	1	SERVED	50000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
199	118	2	1	CANCELLED	50000.00	\N	\N	\N	2026-09-10 02:59:30.24	WAITING	2026-09-10 02:59:29.52
313	214	2	1	SERVED	50000.00	\N	\N	\N	2026-09-20 02:59:26.753	WAITING	2026-09-20 02:59:24.999
172	94	2	1	SERVED	50000.00	\N	2026-09-07 15:00:22.717	\N	2026-09-07 14:36:05.896	COMPLETED	2026-09-07 21:58:56.254
256	171	3	1	CANCELLED	60000.00	\N	\N	\N	\N	WAITING	2026-09-19 06:17:02.077
150	76	19	1	SERVED	35000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
152	76	20	1	SERVED	45000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
154	77	19	1	CONFIRMED	35000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
252	169	3	1	CANCELLED	60000.00	\N	\N	\N	2026-09-19 06:17:12.274	WAITING	2026-09-19 06:04:32.98
156	79	4	1	SERVED	58000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
254	169	3	1	CANCELLED	60000.00	\N	\N	\N	2026-09-19 06:17:12.274	WAITING	2026-09-19 06:05:50.522
317	217	2	1	SERVED	50000.00	\N	\N	\N	2026-09-20 09:09:04.672	WAITING	2026-09-20 09:06:38.951
157	80	5	1	SERVED	55000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
258	174	3	1	SERVED	60000.00	\N	\N	\N	2026-09-19 13:50:57.738	WAITING	2026-09-19 09:48:35.453
158	81	7	1	SERVED	75000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
179	100	6	1	SERVED	60000.00	\N	2026-09-07 15:10:07.802	\N	2026-09-07 15:09:49.55	COMPLETED	2026-09-07 15:09:48.009
260	175	1	1	SERVED	55000.00	\N	\N	\N	2026-09-19 14:02:46.884	WAITING	2026-09-19 14:02:39.766
160	83	7	1	SERVED	75000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
161	84	3	1	CONFIRMED	60000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
162	85	3	1	CONFIRMED	60000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
202	123	2	1	SERVED	50000.00	\N	2026-09-15 09:38:07.99	\N	2026-09-15 09:24:19.522	COMPLETED	2026-09-15 09:24:17.881
204	123	13	1	SERVED	18000.00	\N	2026-09-15 09:38:07.99	\N	2026-09-15 09:27:49.915	COMPLETED	2026-09-15 09:27:49.092
164	87	2	1	SERVED	50000.00	\N	\N	\N	\N	WAITING	2026-09-07 21:58:56.254
205	123	8	1	SERVED	65000.00	\N	2026-09-15 09:38:07.99	\N	2026-09-15 09:29:36.336	COMPLETED	2026-09-15 09:29:35.446
322	222	3	1	SERVED	60000.00	\N	\N	\N	2026-09-20 10:26:03.311	WAITING	2026-09-20 10:25:22.703
177	98	18	1	SERVED	30000.00	\N	2026-09-07 15:10:03.88	\N	2026-09-07 15:02:19.26	COMPLETED	2026-09-07 15:00:37.413
181	102	8	1	SERVED	65000.00	\N	2026-09-07 15:32:41.391	\N	2026-09-07 15:19:56.955	COMPLETED	2026-09-07 15:19:55.791
183	103	9	1	SERVED	299000.00	\N	2026-09-07 15:32:43.006	\N	2026-09-07 15:21:38.637	COMPLETED	2026-09-07 15:21:27.733
185	105	3	1	CONFIRMED	60000.00	\N	\N	\N	2026-09-08 01:49:52.66	WAITING	2026-09-08 01:49:52.664
263	175	2	1	CANCELLED	50000.00	\N	\N	\N	2026-09-19 14:07:45.61	WAITING	2026-09-19 14:07:44.28
220	137	13	1	SERVED	18000.00	\N	2026-09-15 13:31:46.397	\N	2026-09-15 13:31:40.779	COMPLETED	2026-09-15 13:31:39.786
319	222	2	1	SERVED	50000.00	\N	\N	\N	2026-09-20 10:26:03.311	WAITING	2026-09-20 10:19:24.065
207	124	2	1	CONFIRMED	50000.00	\N	2026-09-15 10:03:22.594	\N	2026-09-15 09:50:10.388	COMPLETED	2026-09-15 09:50:10.39
208	125	2	1	CONFIRMED	50000.00	\N	2026-09-15 10:03:23.023	\N	2026-09-15 09:50:24.373	COMPLETED	2026-09-15 09:50:24.374
210	127	7	1	CONFIRMED	75000.00	\N	2026-09-15 10:03:23.832	\N	2026-09-15 09:59:04.438	COMPLETED	2026-09-15 09:59:04.441
265	176	2	1	SERVED	50000.00	\N	\N	\N	2026-09-19 14:15:58.314	WAITING	2026-09-19 14:15:57.028
324	224	21	1	SERVED	30000.00	\N	\N	\N	2026-09-22 14:02:37.225	WAITING	2026-09-22 14:02:36.198
267	176	2	1	SERVED	50000.00	\N	\N	\N	2026-09-19 14:17:43.088	WAITING	2026-09-19 14:17:37.831
222	140	4	1	SERVED	58000.00	\N	\N	\N	2026-09-16 09:48:42.673	WAITING	2026-09-16 03:49:54.729
225	143	3	1	SERVED	60000.00	\N	\N	\N	2026-09-16 09:49:01.856	WAITING	2026-09-16 09:49:00.895
325	227	1	1	SERVED	55000.00	\N	\N	\N	2026-09-22 14:03:29.965	WAITING	2026-09-22 14:03:28.492
227	147	2	1	SERVED	50000.00	\N	\N	\N	2026-09-16 12:37:32.685	WAITING	2026-09-16 12:37:19.589
229	148	22	1	CONFIRMED	35000.00	\N	\N	\N	2026-09-16 12:47:07.36	WAITING	2026-09-16 12:47:07.361
270	180	2	1	SERVED	50000.00	\N	\N	\N	2026-09-19 14:20:32.153	WAITING	2026-09-19 14:20:20.23
231	150	3	1	SERVED	60000.00	\N	\N	\N	2026-09-16 14:16:40.139	WAITING	2026-09-16 14:16:16.768
327	225	19	1	SERVED	35000.00	\N	\N	\N	2026-09-22 14:05:12.253	WAITING	2026-09-22 14:05:11.477
233	152	2	1	SERVED	50000.00	\N	\N	\N	2026-09-17 13:17:04.395	WAITING	2026-09-17 13:17:03.575
330	231	22	1	SERVED	35000.00	\N	\N	\N	2026-09-22 14:48:07.351	WAITING	2026-09-22 14:48:05.781
235	154	1	1	SERVED	55000.00	\N	\N	\N	2026-09-18 02:04:49.641	WAITING	2026-09-18 02:04:48.622
238	156	3	1	SERVED	60000.00	\N	\N	\N	2026-09-18 02:54:32.896	WAITING	2026-09-18 02:46:39.913
239	156	2	1	SERVED	50000.00	\N	\N	\N	2026-09-18 02:54:32.896	WAITING	2026-09-18 02:46:39.919
\.


--
-- Data for Name: order_members; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_members (id, customer_id, order_id, joined_at) FROM stdin;
1	1	1	2026-07-28 14:31:38.822
2	3	2	2026-07-28 14:31:38.85
3	4	3	2026-07-31 01:57:34.522
4	8	6	2026-08-04 08:12:09.347
5	9	7	2026-08-04 08:50:28.251
6	11	8	2026-08-04 08:51:42.455
7	18	9	2026-08-07 03:49:20.394
8	19	10	2026-08-07 08:49:16.021
9	20	11	2026-08-07 09:01:50.891
10	26	12	2026-08-10 02:35:28.836
11	76	13	2026-08-11 07:30:34.501
14	77	16	2026-08-11 07:59:48.335
16	73	18	2026-08-11 08:04:16.36
17	78	19	2026-08-11 08:23:50.317
18	78	20	2026-08-11 09:04:45.032
19	80	21	2026-08-13 03:53:38.818
20	81	22	2026-08-17 08:39:02.986
21	82	23	2026-08-17 09:09:38.074
22	83	24	2026-08-17 09:24:45.494
23	81	25	2026-08-17 09:42:56.758
24	81	26	2026-08-17 09:56:46.01
25	81	27	2026-08-17 09:58:35.318
26	84	31	2026-08-17 14:15:27.323
27	85	33	2026-08-20 12:47:18.995
28	86	36	2026-08-20 12:51:45.886
29	87	37	2026-08-20 13:30:49.866
30	88	38	2026-08-20 13:31:02.821
31	89	39	2026-08-20 13:31:09.43
32	90	40	2026-08-20 13:54:05.231
33	91	41	2026-08-20 14:03:11.581
34	92	42	2026-08-20 14:03:20.795
35	93	43	2026-08-20 14:05:45.026
36	81	44	2026-08-20 14:07:43.86
37	94	45	2026-08-20 14:19:02.406
38	95	47	2026-08-20 15:15:50.718
39	96	48	2026-08-20 15:22:59.264
40	97	50	2026-08-21 03:49:06.031
41	98	51	2026-08-21 12:14:50.019
42	99	52	2026-08-21 12:54:26.829
43	80	53	2026-08-23 05:04:46.969
44	17	53	2026-08-23 05:04:55.099
45	100	53	2026-08-23 05:06:38.275
46	80	54	2026-08-23 05:16:11.829
47	100	54	2026-08-23 05:16:17.603
48	80	55	2026-08-23 05:18:01.748
49	100	55	2026-08-23 05:18:08.007
50	101	56	2026-08-23 05:31:48.582
51	80	57	2026-08-23 05:32:22.927
52	80	58	2026-08-23 06:01:27.547
53	100	58	2026-08-23 06:06:04.221
54	100	59	2026-08-23 06:06:26.874
55	100	60	2026-08-23 08:18:28.258
56	100	61	2026-08-23 08:50:09.584
57	100	62	2026-08-23 08:50:41.194
58	100	63	2026-08-23 09:21:06.54
59	100	64	2026-08-23 09:28:03.384
60	11	65	2026-08-23 09:28:36.182
61	100	66	2026-08-23 09:38:32.336
62	11	67	2026-08-23 10:40:27.145
63	100	68	2026-08-23 10:40:53.177
64	104	68	2026-08-23 10:41:29.949
65	100	69	2026-08-23 14:21:20.04
66	11	70	2026-08-23 14:55:26.58
67	100	71	2026-08-23 14:55:56.255
68	11	72	2026-08-23 15:00:53.116
69	105	73	2026-08-23 15:07:47.277
70	100	74	2026-08-23 15:19:19.986
71	11	75	2026-08-23 15:31:35.44
72	81	76	2026-08-24 03:31:37.573
73	107	78	2026-08-24 05:01:43.038
74	108	79	2026-08-24 07:46:51.374
75	1	80	2026-08-25 04:28:43.585
76	109	81	2026-08-25 07:30:43.644
77	8	82	2026-08-25 09:24:52.143
78	110	83	2026-08-25 09:25:23.908
79	113	86	2026-09-03 08:01:59.126
80	110	87	2026-09-03 08:07:42.907
81	114	88	2026-09-03 08:46:55.791
82	115	89	2026-09-03 08:52:14.563
83	100	90	2026-09-03 08:54:12.272
84	116	91	2026-09-03 08:55:25.334
85	117	92	2026-09-03 08:57:22.603
86	118	93	2026-09-03 09:01:14.081
87	122	94	2026-09-07 12:10:53.832
88	122	95	2026-09-07 12:14:56.397
89	123	96	2026-09-07 12:15:48.366
90	124	97	2026-09-07 14:43:24.064
91	125	98	2026-09-07 15:00:31.178
92	126	99	2026-09-07 15:04:10.356
93	127	100	2026-09-07 15:09:42.35
94	128	101	2026-09-07 15:19:20.43
95	129	102	2026-09-07 15:19:52.267
96	130	103	2026-09-07 15:21:21.127
97	131	104	2026-09-07 15:30:39.868
98	132	109	2026-09-08 02:35:03.698
99	133	110	2026-09-08 02:36:50.246
100	100	111	2026-09-08 02:44:07.364
101	134	113	2026-09-10 02:42:55.229
102	135	114	2026-09-10 02:43:37.665
103	136	115	2026-09-10 02:45:41.658
104	137	116	2026-09-10 02:48:38.87
105	138	117	2026-09-10 02:51:40.648
106	139	118	2026-09-10 02:59:26.429
107	140	119	2026-09-10 02:59:35.922
108	141	120	2026-09-15 08:06:02.58
111	144	123	2026-09-15 09:24:12.835
112	80	129	2026-09-15 11:15:19.445
113	145	130	2026-09-15 11:19:05.048
115	80	132	2026-09-15 12:54:16.57
119	150	137	2026-09-15 13:31:37.076
121	152	139	2026-09-16 03:39:30.453
122	155	140	2026-09-16 03:49:49.454
123	156	141	2026-09-16 03:50:01.542
124	157	143	2026-09-16 09:48:56.17
126	159	146	2026-09-16 12:27:34.313
127	160	147	2026-09-16 12:30:24.939
128	161	149	2026-09-16 12:47:42.476
129	80	150	2026-09-16 14:16:16.761
131	163	152	2026-09-17 13:17:00.194
130	162	152	2026-09-17 12:56:54.263
132	80	153	2026-09-18 02:04:09.261
133	164	154	2026-09-18 02:04:43.812
134	80	155	2026-09-18 02:43:20.264
135	80	156	2026-09-18 02:46:39.901
136	80	157	2026-09-18 03:12:30.824
137	80	158	2026-09-18 03:16:34.276
138	80	159	2026-09-18 03:20:43.311
139	80	160	2026-09-18 03:24:48.653
146	169	167	2026-09-19 05:51:03.703
147	167	168	2026-09-19 06:03:30.903
148	169	169	2026-09-19 06:09:01.101
149	167	171	2026-09-19 06:16:59.783
150	167	172	2026-09-19 06:21:20.772
152	178	174	2026-09-19 13:50:35.795
151	177	174	2026-09-19 09:48:32.458
153	80	175	2026-09-19 14:02:39.752
154	179	176	2026-09-19 14:15:54.197
155	80	177	2026-09-19 14:17:18.017
158	182	180	2026-09-19 14:20:16.444
189	80	210	2026-09-20 01:40:37.594
191	209	212	2026-09-20 02:58:10.991
193	211	214	2026-09-20 02:59:20.925
196	214	217	2026-09-20 08:07:36.548
201	219	222	2026-09-20 10:25:18.139
198	216	222	2026-09-20 10:19:19.826
202	220	223	2026-09-22 13:55:54.647
203	221	224	2026-09-22 14:02:30.9
204	222	225	2026-09-22 14:02:30.958
205	223	226	2026-09-22 14:02:31.043
206	224	227	2026-09-22 14:03:24.083
207	225	228	2026-09-22 14:05:19.842
208	226	229	2026-09-22 14:23:07.642
210	229	231	2026-09-22 14:48:03.142
211	230	232	2026-09-22 14:48:16.097
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, order_code, branch_id, session_id, "orderType", status, total_amount, note, created_at, updated_at, created_by_customer_id, created_by_user_id) FROM stdin;
22	OD1786955942938	1	22	DINE_IN	COMPLETED	173000.00	\N	2026-08-17 08:39:02.94	2026-08-17 09:20:18.129	\N	\N
58	OD1787464887531-639	1	42	DINE_IN	COMPLETED	148000.00	\N	2026-08-23 06:01:27.533	2026-08-23 06:06:50.892	\N	\N
47	B-1787238950713	1	32	DINE_IN	COMPLETED	221000.00	\N	2026-08-20 15:15:50.714	2026-08-20 15:20:44.325	\N	\N
13	B-1786433434473	1	13	DINE_IN	COMPLETED	470000.00	\N	2026-08-11 07:30:34.474	2026-08-11 07:55:04.407	\N	\N
74	OD1787498359972-989	3	53	DINE_IN	COMPLETED	115000.00	\N	2026-08-23 15:19:19.974	2026-08-23 15:29:44.931	\N	\N
23	B-1786957778070	1	22	DINE_IN	COMPLETED	226000.00	\N	2026-08-17 09:09:38.071	2026-08-17 09:20:45.704	\N	\N
57	OD1787463142919-242	1	41	DINE_IN	COMPLETED	55000.00	\N	2026-08-23 05:32:22.92	2026-08-23 06:09:40.027	\N	\N
3	B-1785463054513	1	2	DINE_IN	COMPLETED	50000.00	\N	2026-07-31 01:57:34.514	2026-07-31 01:57:44.495	\N	\N
4	TA-1785463081975	1	\N	TAKE_AWAY	COMPLETED	35000.00	\N	2026-07-31 01:58:01.977	2026-07-31 01:58:01.977	\N	\N
61	OD1787475009564-377	1	44	DINE_IN	COMPLETED	75000.00	\N	2026-08-23 08:50:09.566	2026-08-23 08:50:28.994	\N	\N
2	B-1785249098847-2	1	1	DINE_IN	COMPLETED	151000.00	\N	2026-07-28 14:31:38.848	2026-07-31 04:17:38.471	\N	\N
24	B-1786958685457	1	23	DINE_IN	COMPLETED	50000.00	\N	2026-08-17 09:24:45.459	2026-08-17 09:25:20.555	\N	\N
1	B-1785249098812-1	1	1	DINE_IN	COMPLETED	128000.00	\N	2026-07-28 14:31:38.813	2026-07-31 04:17:43.173	\N	\N
5	TA-1785471702181	1	\N	TAKE_AWAY	COMPLETED	118000.00	\N	2026-07-31 04:21:42.183	2026-07-31 04:21:42.183	\N	\N
60	OD1787473108226-731	1	43	DINE_IN	COMPLETED	60000.00	\N	2026-08-23 08:18:28.227	2026-08-23 08:43:04.484	\N	\N
25	OD1786959776725	1	24	DINE_IN	COMPLETED	60000.00	\N	2026-08-17 09:42:56.727	2026-08-17 09:46:49.235	\N	\N
26	TA-1786960605986	1	\N	TAKE_AWAY	COMPLETED	55000.00	\N	2026-08-17 09:56:45.988	2026-08-17 09:56:45.988	\N	\N
27	TA-1786960715298	1	\N	TAKE_AWAY	COMPLETED	90000.00	\N	2026-08-17 09:58:35.3	2026-08-17 09:58:35.3	\N	\N
28	TA-1786960834492	1	\N	TAKE_AWAY	COMPLETED	329000.00	\N	2026-08-17 10:00:34.494	2026-08-17 10:00:34.494	\N	\N
8	OD1785833502448	1	7	DINE_IN	COMPLETED	317000.00	\N	2026-08-04 08:51:42.449	2026-08-07 03:29:45.268	\N	\N
18	OD1786435456329	1	18	DINE_IN	COMPLETED	178000.00	\N	2026-08-11 08:04:16.331	2026-08-11 08:23:41.603	\N	\N
29	TA-1786961385904	1	\N	TAKE_AWAY	COMPLETED	100000.00	\N	2026-08-17 10:09:45.905	2026-08-17 10:09:45.905	\N	\N
30	TA-1786961529063	1	\N	TAKE_AWAY	COMPLETED	60000.00	\N	2026-08-17 10:12:09.064	2026-08-17 10:12:09.064	\N	\N
45	B-1787235542400	1	31	DINE_IN	COMPLETED	609000.00	\N	2026-08-20 14:19:02.401	2026-08-20 15:14:44.572	\N	\N
46	TA-1787238891350	1	\N	TAKE_AWAY	COMPLETED	50000.00	\N	2026-08-20 15:14:51.353	2026-08-20 15:14:51.353	\N	\N
37	B-1787232649856	3	28	DINE_IN	CANCELLED	0.00	\N	2026-08-20 13:30:49.857	2026-08-20 13:52:10.079	\N	\N
9	B-1786074560385	1	5	DINE_IN	COMPLETED	110000.00	\N	2026-08-07 03:49:20.387	2026-08-07 03:49:37.445	\N	\N
19	OD1786436630298	1	19	DINE_IN	COMPLETED	50000.00	\N	2026-08-11 08:23:50.301	2026-08-11 08:39:33.122	\N	\N
6	OD1785831129308	1	5	DINE_IN	COMPLETED	58000.00	\N	2026-08-04 08:12:09.31	2026-08-07 03:57:23.285	\N	\N
31	B-1786976127291	3	25	DINE_IN	COMPLETED	75000.00	\N	2026-08-17 14:15:27.292	2026-08-17 14:15:42.09	\N	\N
32	TA-1786976159257	3	\N	TAKE_AWAY	COMPLETED	53000.00	\N	2026-08-17 14:15:59.259	2026-08-17 14:15:59.259	\N	\N
75	OD1787499095384-953	3	54	DINE_IN	COMPLETED	148000.00	\N	2026-08-23 15:31:35.385	2026-08-23 15:36:34.581	\N	\N
7	OD1785833428236	1	6	DINE_IN	COMPLETED	125000.00	\N	2026-08-04 08:50:28.239	2026-08-07 08:47:58.893	\N	\N
20	OD1786439085015	1	20	DINE_IN	COMPLETED	359000.00	\N	2026-08-11 09:04:45.017	2026-08-11 09:05:03.53	\N	\N
16	B-1786435188325	1	16	DINE_IN	COMPLETED	50000.00	\N	2026-08-11 07:59:48.327	2026-08-11 14:27:28.747	\N	\N
71	OD1787496956243-889	3	50	DINE_IN	COMPLETED	55000.00	\N	2026-08-23 14:55:56.245	2026-08-23 14:57:20.309	\N	\N
10	B-1786092556012	1	10	DINE_IN	COMPLETED	75000.00	\N	2026-08-07 08:49:16.014	2026-08-07 09:01:45.536	\N	\N
33	B-1787230038964	3	26	DINE_IN	COMPLETED	105000.00	\N	2026-08-20 12:47:18.966	2026-08-20 12:48:45.446	\N	\N
34	TA-1787230263441	3	\N	TAKE_AWAY	COMPLETED	65000.00	\N	2026-08-20 12:51:03.442	2026-08-20 12:51:03.442	\N	\N
21	OD1786593218741	1	21	DINE_IN	COMPLETED	161000.00	\N	2026-08-13 03:53:38.744	2026-08-13 03:53:59.723	\N	\N
35	TA-1787230283946	3	\N	TAKE_AWAY	COMPLETED	50000.00	\N	2026-08-20 12:51:23.949	2026-08-20 12:51:23.949	\N	\N
39	B-1787232669426	3	28	DINE_IN	CANCELLED	0.00	\N	2026-08-20 13:31:09.427	2026-08-20 13:54:20.082	\N	\N
11	B-1786093310885	1	11	DINE_IN	COMPLETED	83000.00	\N	2026-08-07 09:01:50.887	2026-08-07 09:02:02.349	\N	\N
48	B-1787239379233	1	33	DINE_IN	COMPLETED	50000.00	\N	2026-08-20 15:22:59.234	2026-08-20 15:23:07.218	\N	\N
49	TA-1787239397974	1	\N	TAKE_AWAY	COMPLETED	75000.00	\N	2026-08-20 15:23:17.976	2026-08-20 15:23:17.976	\N	\N
36	B-1787230305882	3	27	DINE_IN	COMPLETED	50000.00	\N	2026-08-20 12:51:45.883	2026-08-20 13:20:47.879	\N	\N
63	OD1787476866505-29	1	45	DINE_IN	COMPLETED	55000.00	\N	2026-08-23 09:21:06.507	2026-08-23 09:21:36.617	\N	\N
12	B-1786329328824	1	12	DINE_IN	COMPLETED	58000.00	\N	2026-08-10 02:35:28.825	2026-08-11 03:14:38.768	\N	\N
38	B-1787232662816	3	28	DINE_IN	CANCELLED	0.00	\N	2026-08-20 13:31:02.817	2026-08-20 13:55:17.461	\N	\N
76	OD1787542297510-150	1	55	DINE_IN	COMPLETED	173000.00	\N	2026-08-24 03:31:37.512	2026-08-24 03:46:50.598	\N	\N
77	TA-1787543425626	1	\N	TAKE_AWAY	COMPLETED	35000.00	\N	2026-08-24 03:50:25.628	2026-08-24 03:50:25.628	\N	\N
62	OD1787475041179-492	1	45	DINE_IN	COMPLETED	120000.00	\N	2026-08-23 08:50:41.182	2026-08-23 09:21:45.634	\N	\N
50	B-1787284145994	1	34	DINE_IN	COMPLETED	35000.00	\N	2026-08-21 03:49:05.995	2026-08-21 03:49:21.687	\N	\N
40	B-1787234045227	3	28	DINE_IN	COMPLETED	612000.00	\N	2026-08-20 13:54:05.228	2026-08-20 13:57:01.868	\N	\N
66	OD1787477912316-109	3	47	DINE_IN	COMPLETED	50000.00	\N	2026-08-23 09:38:32.319	2026-08-23 09:38:53.332	\N	\N
78	B-1787547703031	1	56	DINE_IN	COMPLETED	35000.00	\N	2026-08-24 05:01:43.032	2026-08-24 05:01:55.723	\N	\N
51	B-1787314489978	1	35	DINE_IN	COMPLETED	115000.00	\N	2026-08-21 12:14:49.98	2026-08-21 12:28:13.286	\N	\N
41	B-1787234591573	3	29	DINE_IN	CANCELLED	0.00	\N	2026-08-20 14:03:11.574	2026-08-20 14:03:34.649	\N	\N
65	OD1787477316169-119	3	47	DINE_IN	COMPLETED	55000.00	\N	2026-08-23 09:28:36.171	2026-08-23 09:38:59.12	\N	\N
42	B-1787234600789	3	29	DINE_IN	CANCELLED	0.00	\N	2026-08-20 14:03:20.791	2026-08-20 14:06:03.235	\N	\N
79	B-1787557611341	1	57	DINE_IN	COMPLETED	58000.00	\N	2026-08-24 07:46:51.343	2026-08-24 07:47:31.417	\N	\N
43	B-1787234745023	3	29	DINE_IN	COMPLETED	115000.00	\N	2026-08-20 14:05:45.024	2026-08-20 14:06:10.148	\N	\N
67	OD1787481627097-427	3	48	DINE_IN	COMPLETED	90000.00	\N	2026-08-23 10:40:27.099	2026-08-23 10:42:30.922	\N	\N
52	B-1787316866823	3	36	DINE_IN	COMPLETED	105000.00	\N	2026-08-21 12:54:26.824	2026-08-21 12:56:25.433	\N	\N
53	OD1787461486919	1	37	DINE_IN	COMPLETED	208000.00	\N	2026-08-23 05:04:46.921	2026-08-23 05:11:24.596	\N	\N
44	OD1787234863852	3	30	DINE_IN	COMPLETED	113000.00	\N	2026-08-20 14:07:43.854	2026-08-20 14:08:27.4	\N	\N
56	B-1787463108563	1	40	DINE_IN	COMPLETED	35000.00	\N	2026-08-23 05:31:48.565	2026-08-23 05:32:07.421	\N	\N
68	OD1787481653164-429	3	48	DINE_IN	COMPLETED	180000.00	\N	2026-08-23 10:40:53.166	2026-08-23 10:42:22.863	\N	\N
80	OD1787632123540-498	1	58	DINE_IN	COMPLETED	55000.00	\N	2026-08-25 04:28:43.542	2026-08-25 09:22:14.807	\N	\N
54	OD1787462171760-271	1	38	DINE_IN	COMPLETED	76000.00	\N	2026-08-23 05:16:11.762	2026-08-23 05:16:36.976	\N	\N
81	B-1787643043610	1	58	DINE_IN	COMPLETED	75000.00	\N	2026-08-25 07:30:43.612	2026-08-25 09:22:26.187	\N	\N
69	OD1787494880019-151	3	49	DINE_IN	COMPLETED	50000.00	\N	2026-08-23 14:21:20.02	2026-08-23 14:21:45.682	\N	\N
64	OD1787477283366-146	1	46	DINE_IN	COMPLETED	65000.00	\N	2026-08-23 09:28:03.369	2026-08-23 09:28:03.416	\N	\N
55	OD1787462281729-381	1	39	DINE_IN	COMPLETED	130000.00	\N	2026-08-23 05:18:01.731	2026-08-23 05:18:29.107	\N	\N
70	OD1787496926549-822	3	50	DINE_IN	COMPLETED	75000.00	\N	2026-08-23 14:55:26.551	2026-08-23 14:57:10.211	\N	\N
59	OD1787465186866-123	1	42	DINE_IN	COMPLETED	18000.00	\N	2026-08-23 06:06:26.868	2026-08-23 06:06:42.766	\N	\N
73	B-1787497667272	3	52	DINE_IN	COMPLETED	354000.00	\N	2026-08-23 15:07:47.274	2026-08-23 15:08:12.074	\N	\N
72	OD1787497253074-761	3	51	DINE_IN	COMPLETED	542000.00	\N	2026-08-23 15:00:53.075	2026-08-23 15:19:11.142	\N	\N
111	TA-1788835447332	1	\N	TAKE_AWAY	COMPLETED	60000.00	\N	2026-09-08 02:44:07.334	2026-09-08 02:50:43.231	100	8
108	TA-1788834447071	1	\N	TAKE_AWAY	COMPLETED	83000.00	\N	2026-09-08 02:27:27.073	2026-09-08 02:50:48.747	\N	8
112	TA-1788840099589	1	\N	TAKE_AWAY	COMPLETED	58000.00	\N	2026-09-08 04:01:39.592	2026-09-08 04:18:28.242	\N	8
92	B-1788425842563	1	65	DINE_IN	COMPLETED	65000.00	\N	2026-09-03 08:57:22.565	2026-09-03 08:57:40.566	117	4
83	OD1787649923895-428	1	59	DINE_IN	COMPLETED	75000.00	\N	2026-08-25 09:25:23.897	2026-08-25 09:25:56.339	\N	\N
110	B-1788835010240	1	76	DINE_IN	COMPLETED	50000.00	\N	2026-09-08 02:36:50.241	2026-09-08 04:31:54.002	133	8
109	B-1788834903690	1	75	DINE_IN	COMPLETED	50000.00	\N	2026-09-08 02:35:03.692	2026-09-08 04:32:00.022	132	8
82	OD1787649892122-666	1	59	DINE_IN	COMPLETED	58000.00	\N	2026-08-25 09:24:52.123	2026-08-25 09:26:02.77	\N	\N
84	TA-1788406542109	1	\N	TAKE_AWAY	COMPLETED	60000.00	\N	2026-09-03 03:35:42.111	2026-09-03 03:35:42.111	\N	\N
85	TA-1788422104509	1	\N	TAKE_AWAY	COMPLETED	60000.00	\N	2026-09-03 07:55:04.511	2026-09-03 07:55:04.511	\N	\N
113	B-1789008175181	1	77	DINE_IN	CANCELLED	0.00	\N	2026-09-10 02:42:55.183	2026-09-10 02:43:17.278	134	8
93	B-1788426074052	1	66	DINE_IN	COMPLETED	50000.00	\N	2026-09-03 09:01:14.054	2026-09-03 09:01:38.246	118	4
139	B-1789529970445	1	78	DINE_IN	COMPLETED	55000.00	\N	2026-09-16 03:39:30.446	2026-09-16 03:39:41.063	152	8
86	B-1788422519120	1	60	DINE_IN	COMPLETED	60000.00	\N	2026-09-03 08:01:59.121	2026-09-03 08:03:30.048	113	\N
114	B-1789008217660	1	77	DINE_IN	CANCELLED	0.00	\N	2026-09-10 02:43:37.662	2026-09-10 02:43:49.648	135	8
115	B-1789008341626	1	77	DINE_IN	CANCELLED	0.00	\N	2026-09-10 02:45:41.628	2026-09-10 02:45:54.818	136	8
87	OD1788422862886	1	61	DINE_IN	COMPLETED	50000.00	\N	2026-09-03 08:07:42.888	2026-09-03 08:07:57.093	110	\N
141	B-1789530601530	4	84	DINE_IN	COMPLETED	35000.00	\N	2026-09-16 03:50:01.532	2026-09-16 09:45:21.913	156	3
116	B-1789008518865	1	77	DINE_IN	COMPLETED	50000.00	\N	2026-09-10 02:48:38.866	2026-09-10 02:51:31.475	137	8
88	OD1788425215762	1	62	DINE_IN	COMPLETED	93000.00	\N	2026-09-03 08:46:55.763	2026-09-03 08:47:09.153	114	\N
117	B-1789008700642	1	78	DINE_IN	CANCELLED	0.00	\N	2026-09-10 02:51:40.643	2026-09-10 02:51:47.658	138	8
140	B-1789530589446	1	85	DINE_IN	COMPLETED	58000.00	\N	2026-09-16 03:49:49.448	2026-09-16 09:48:46.762	155	8
142	TA-1789530784320	1	\N	TAKE_AWAY	COMPLETED	30000.00	\N	2026-09-16 03:53:04.325	2026-09-16 09:48:52.369	\N	8
89	B-1788425534557	1	63	DINE_IN	COMPLETED	50000.00	\N	2026-09-03 08:52:14.559	2026-09-03 08:52:41.109	115	\N
90	TA-1788425652247	1	\N	TAKE_AWAY	COMPLETED	75000.00	\N	2026-09-03 08:54:12.249	2026-09-03 08:54:12.249	100	8
95	OD1788783296378	1	67	DINE_IN	COMPLETED	60000.00	\N	2026-09-07 12:14:56.379	2026-09-07 14:36:02.129	122	\N
118	B-1789009166415	1	79	DINE_IN	CANCELLED	0.00	\N	2026-09-10 02:59:26.417	2026-09-10 02:59:32.576	139	8
143	B-1789552136141	1	86	DINE_IN	COMPLETED	60000.00	\N	2026-09-16 09:48:56.143	2026-09-16 09:49:05.617	157	8
175	OD1789826559640	1	101	DINE_IN	COMPLETED	225000.00	\N	2026-09-19 14:02:39.643	2026-09-19 14:14:14.798	80	\N
91	B-1788425725319	1	64	DINE_IN	COMPLETED	359000.00	\N	2026-09-03 08:55:25.321	2026-09-03 08:55:45.136	116	4
94	OD1788783053775	1	67	DINE_IN	COMPLETED	50000.00	\N	2026-09-07 12:10:53.777	2026-09-07 14:36:14.235	122	\N
96	OD1788783348349	1	67	DINE_IN	COMPLETED	133000.00	\N	2026-09-07 12:15:48.351	2026-09-07 14:36:20.336	123	\N
119	B-1789009175912	1	78	DINE_IN	CANCELLED	0.00	\N	2026-09-10 02:59:35.914	2026-09-10 02:59:43.33	140	8
145	TA-1789552489971	4	\N	TAKE_AWAY	COMPLETED	35000.00	\N	2026-09-16 09:54:49.982	2026-09-16 09:54:59.407	\N	3
120	B-1789459562505	1	78	DINE_IN	CANCELLED	0.00	\N	2026-09-15 08:06:02.507	2026-09-15 08:06:10.672	141	8
149	B-1789562862469	4	89	DINE_IN	COMPLETED	35000.00	\N	2026-09-16 12:47:42.47	2026-09-20 02:45:11.392	161	3
147	B-1789561824912	1	88	DINE_IN	COMPLETED	50000.00	\N	2026-09-16 12:30:24.913	2026-09-16 12:37:46.767	160	4
146	B-1789561654299	4	87	DINE_IN	COMPLETED	35000.00	\N	2026-09-16 12:27:34.3	2026-09-16 12:46:56.88	159	9
148	TA-1789562827358	4	\N	TAKE_AWAY	COMPLETED	35000.00	\N	2026-09-16 12:47:07.361	2026-09-16 12:47:20.24	\N	9
100	B-1788793782344	1	70	DINE_IN	COMPLETED	60000.00	\N	2026-09-07 15:09:42.345	2026-09-07 15:19:15.831	127	8
150	OD1789568176726	1	90	DINE_IN	COMPLETED	60000.00	\N	2026-09-16 14:16:16.728	2026-09-16 14:16:43.729	80	\N
123	B-1789464252829	1	79	DINE_IN	COMPLETED	238000.00	\N	2026-09-15 09:24:12.83	2026-09-15 09:43:03.457	144	8
152	B-1789651020176	1	92	DINE_IN	COMPLETED	80000.00	\N	2026-09-17 13:17:00.178	2026-09-17 13:17:37.508	163	8
97	B-1788792204050	1	68	DINE_IN	COMPLETED	55000.00	\N	2026-09-07 14:43:24.052	2026-09-08 01:48:29.663	124	8
99	B-1788793450343	1	46	DINE_IN	COMPLETED	75000.00	\N	2026-09-07 15:04:10.346	2026-09-08 01:48:37.122	126	8
98	B-1788793231164	1	69	DINE_IN	COMPLETED	30000.00	\N	2026-09-07 15:00:31.165	2026-09-08 01:48:42.737	125	8
102	B-1788794392260	1	72	DINE_IN	COMPLETED	65000.00	\N	2026-09-07 15:19:52.262	2026-09-08 01:48:49.475	129	8
101	B-1788794360409	1	71	DINE_IN	COMPLETED	65000.00	\N	2026-09-07 15:19:20.41	2026-09-08 01:48:58.404	128	8
128	TA-1789466559609	1	\N	TAKE_AWAY	COMPLETED	18000.00	\N	2026-09-15 10:02:39.614	2026-09-15 10:08:41.528	\N	8
104	B-1788795039860	1	74	DINE_IN	COMPLETED	18000.00	\N	2026-09-07 15:30:39.862	2026-09-08 01:49:05.151	131	8
127	TA-1789466344436	1	\N	TAKE_AWAY	COMPLETED	75000.00	\N	2026-09-15 09:59:04.441	2026-09-15 10:08:43.636	\N	8
103	B-1788794481123	1	73	DINE_IN	COMPLETED	324000.00	\N	2026-09-07 15:21:21.124	2026-09-08 01:49:13.577	130	8
105	TA-1788832192662	1	\N	TAKE_AWAY	COMPLETED	60000.00	\N	2026-09-08 01:49:52.664	2026-09-08 01:49:52.664	\N	8
126	TA-1789465851725	1	\N	TAKE_AWAY	COMPLETED	50000.00	\N	2026-09-15 09:50:51.728	2026-09-15 10:08:45.126	\N	8
125	TA-1789465824370	1	\N	TAKE_AWAY	COMPLETED	50000.00	\N	2026-09-15 09:50:24.372	2026-09-15 10:08:46.514	\N	8
107	TA-1788833379961	1	\N	TAKE_AWAY	COMPLETED	50000.00	\N	2026-09-08 02:09:39.963	2026-09-08 02:19:29.069	\N	8
106	TA-1788833160128	1	\N	TAKE_AWAY	COMPLETED	60000.00	\N	2026-09-08 02:06:00.133	2026-09-08 02:19:31.741	\N	8
124	TA-1789465810365	1	\N	TAKE_AWAY	COMPLETED	50000.00	\N	2026-09-15 09:50:10.369	2026-09-15 10:08:47.799	\N	8
153	OD1789697049223	1	93	DINE_IN	COMPLETED	60000.00	\N	2026-09-18 02:04:09.225	2026-09-18 02:04:38.967	80	\N
129	OD1789470919417	1	80	DINE_IN	COMPLETED	55000.00	\N	2026-09-15 11:15:19.419	2026-09-15 11:19:02.148	80	\N
154	B-1789697083795	1	94	DINE_IN	COMPLETED	55000.00	\N	2026-09-18 02:04:43.797	2026-09-18 02:17:02.789	164	8
130	B-1789471145042	1	81	DINE_IN	COMPLETED	35000.00	\N	2026-09-15 11:19:05.044	2026-09-15 11:26:55.381	145	8
155	OD1789699400234	1	95	DINE_IN	COMPLETED	110000.00	\N	2026-09-18 02:43:20.235	2026-09-18 02:46:30.569	80	\N
156	OD1789699599879	1	96	DINE_IN	COMPLETED	110000.00	\N	2026-09-18 02:46:39.881	2026-09-18 02:54:36.037	80	\N
133	TA-1789478230961	1	\N	TAKE_AWAY	COMPLETED	35000.00	\N	2026-09-15 13:17:10.966	2026-09-15 13:19:40.158	\N	8
157	OD1789701150791	1	97	DINE_IN	COMPLETED	50000.00	\N	2026-09-18 03:12:30.793	2026-09-18 03:16:18.61	80	\N
158	OD1789701394264	1	98	DINE_IN	COMPLETED	60000.00	\N	2026-09-18 03:16:34.265	2026-09-18 03:20:29.087	80	\N
137	B-1789479097065	1	82	DINE_IN	COMPLETED	18000.00	\N	2026-09-15 13:31:37.066	2026-09-15 13:31:52.566	150	8
159	OD1789701643294	1	99	DINE_IN	COMPLETED	30000.00	\N	2026-09-18 03:20:43.296	2026-09-18 03:24:37.415	80	\N
132	OD1789476856551	1	83	DINE_IN	COMPLETED	55000.00	\N	2026-09-15 12:54:16.552	2026-09-15 13:32:03.133	80	\N
160	OD1789701888641	1	100	DINE_IN	COMPLETED	58000.00	\N	2026-09-18 03:24:48.642	2026-09-18 03:25:03.045	80	\N
167	B-1789797063639	1	103	DINE_IN	CANCELLED	0.00	\N	2026-09-19 05:51:03.641	2026-09-19 06:03:25.436	169	\N
168	B-1789797810895	1	102	DINE_IN	CANCELLED	0.00	\N	2026-09-19 06:03:30.896	2026-09-19 06:09:12.485	167	\N
174	B-1789825835762	1	104	DINE_IN	COMPLETED	120000.00	\N	2026-09-19 13:50:35.763	2026-09-19 13:51:02.504	178	8
171	B-1789798619744	1	102	DINE_IN	CANCELLED	0.00	\N	2026-09-19 06:16:59.746	2026-09-19 06:17:09.231	167	8
212	B-1789873090947	1	111	DINE_IN	COMPLETED	60000.00	\N	2026-09-20 02:58:10.95	2026-09-20 02:58:33.409	209	4
210	OD1789868437570	1	107	DINE_IN	COMPLETED	319000.00	\N	2026-09-20 01:40:37.572	2026-09-20 02:59:02.273	80	\N
169	B-1789798141079	1	102	DINE_IN	CANCELLED	0.00	\N	2026-09-19 06:09:01.081	2026-09-19 06:21:26.024	169	\N
172	B-1789798880758	1	102	DINE_IN	COMPLETED	60000.00	\N	2026-09-19 06:21:20.76	2026-09-19 06:27:37.473	167	8
214	B-1789873160912	1	112	DINE_IN	COMPLETED	50000.00	\N	2026-09-20 02:59:20.914	2026-09-20 02:59:38.294	211	8
176	B-1789827354163	1	106	DINE_IN	COMPLETED	100000.00	\N	2026-09-19 14:15:54.164	2026-09-19 14:17:50.435	179	8
228	B-1790085919836	4	119	DINE_IN	COMPLETED	58000.00	\N	2026-09-22 14:05:19.837	2026-09-22 14:05:26.728	225	9
177	OD1789827437993	1	106	DINE_IN	COMPLETED	30000.00	\N	2026-09-19 14:17:17.994	2026-09-19 14:17:57.362	80	\N
217	B-1789891656506	1	110	DINE_IN	COMPLETED	100000.00	\N	2026-09-20 08:07:36.507	2026-09-20 09:09:24.764	214	8
180	B-1789827616431	1	108	DINE_IN	COMPLETED	50000.00	\N	2026-09-19 14:20:16.433	2026-09-19 14:20:39.871	182	8
229	B-1790086987620	1	120	DINE_IN	COMPLETED	60000.00	\N	2026-09-22 14:23:07.623	2026-09-22 14:23:21.349	226	8
222	B-1789899918135	1	113	DINE_IN	COMPLETED	110000.00	\N	2026-09-20 10:25:18.136	2026-09-20 10:26:07.622	219	8
223	B-1790085354602	4	116	DINE_IN	COMPLETED	30000.00	\N	2026-09-22 13:55:54.603	2026-09-22 13:56:05.155	220	9
224	B-1790085750878	4	117	DINE_IN	COMPLETED	30000.00	\N	2026-09-22 14:02:30.882	2026-09-22 14:02:42.739	221	9
227	B-1790085804076	1	118	DINE_IN	COMPLETED	55000.00	\N	2026-09-22 14:03:24.078	2026-09-22 14:03:34.339	224	8
231	B-1790088483125	4	121	DINE_IN	COMPLETED	35000.00	\N	2026-09-22 14:48:03.127	2026-09-22 14:48:10.488	229	9
226	B-1790085751038	4	117	DINE_IN	COMPLETED	18000.00	\N	2026-09-22 14:02:31.039	2026-09-22 14:05:05.208	223	9
225	B-1790085750951	4	117	DINE_IN	COMPLETED	35000.00	\N	2026-09-22 14:02:30.952	2026-09-22 14:05:16.392	222	9
232	TA-1790088496053	4	\N	TAKE_AWAY	COMPLETED	35000.00	\N	2026-09-22 14:48:16.077	2026-09-22 14:48:29.238	230	9
\.


--
-- Data for Name: password_reset_otps; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.password_reset_otps (id, email, otp, expires_at, created_at) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payments (id, order_id, payment_method, "cashAmount", "bankAmount", payment_code, total_amount, payment_status, paid_at) FROM stdin;
3	3	CASH	50000.000000000000000000000000000000	\N	\N	50000.00	PAID	2026-07-31 01:57:44.486
4	4	BANKING	\N	35000.000000000000000000000000000000	\N	35000.00	PAID	2026-07-31 01:58:01.991
2	2	CASH	\N	\N	\N	151000.00	PAID	2026-07-31 04:17:38.46
1	1	BANKING	\N	\N	\N	128000.00	PAID	2026-07-31 04:17:43.169
5	5	CASH	118000.000000000000000000000000000000	\N	\N	118000.00	PAID	2026-07-31 04:21:42.224
6	8	CASH	317000.000000000000000000000000000000	\N	\N	317000.00	PAID	2026-08-07 03:29:45.257
7	9	BANKING	\N	110000.000000000000000000000000000000	\N	110000.00	PAID	2026-08-07 03:49:37.433
8	6	CASH	58000.000000000000000000000000000000	\N	\N	58000.00	PAID	2026-08-07 03:57:23.281
9	7	CASH	125000.000000000000000000000000000000	\N	\N	125000.00	PAID	2026-08-07 08:47:58.883
10	10	BANKING	\N	75000.000000000000000000000000000000	\N	75000.00	PAID	2026-08-07 09:01:45.523
11	11	CASH	83000.000000000000000000000000000000	\N	\N	83000.00	PAID	2026-08-07 09:02:02.344
12	12	CASH	58000.000000000000000000000000000000	\N	\N	58000.00	PAID	2026-08-11 03:14:38.746
13	13	BANKING	\N	470000.000000000000000000000000000000	\N	470000.00	PAID	2026-08-11 07:55:04.397
14	18	BANKING	\N	178000.000000000000000000000000000000	\N	178000.00	PAID	2026-08-11 08:23:41.597
15	19	CASH	50000.000000000000000000000000000000	\N	\N	50000.00	PAID	2026-08-11 08:39:33.083
16	20	BANKING	\N	359000.000000000000000000000000000000	\N	359000.00	PAID	2026-08-11 09:05:03.52
17	16	BANKING	\N	50000.000000000000000000000000000000	\N	50000.00	PAID	2026-08-11 14:27:28.738
18	21	BANKING	\N	161000.000000000000000000000000000000	\N	161000.00	PAID	2026-08-13 03:53:59.703
19	22	BANKING	\N	173000.000000000000000000000000000000	\N	173000.00	PAID	2026-08-17 09:20:18.089
20	23	CASH	226000.000000000000000000000000000000	\N	\N	226000.00	PAID	2026-08-17 09:20:45.699
21	24	CASH	50000.000000000000000000000000000000	\N	\N	50000.00	PAID	2026-08-17 09:25:20.549
22	25	CASH	60000.000000000000000000000000000000	\N	\N	60000.00	PAID	2026-08-17 09:46:49.23
23	26	CASH	55000.000000000000000000000000000000	\N	\N	55000.00	PAID	2026-08-17 09:56:46.011
24	27	CASH	90000.000000000000000000000000000000	\N	\N	90000.00	PAID	2026-08-17 09:58:35.319
25	28	BANKING	\N	329000.000000000000000000000000000000	\N	329000.00	PAID	2026-08-17 10:00:34.498
26	29	BANKING	\N	100000.000000000000000000000000000000	\N	100000.00	PAID	2026-08-17 10:09:45.931
27	30	CASH	60000.000000000000000000000000000000	\N	\N	60000.00	PAID	2026-08-17 10:12:09.069
28	31	CASH	75000.000000000000000000000000000000	\N	\N	75000.00	PAID	2026-08-17 14:15:42.083
29	32	BANKING	\N	53000.000000000000000000000000000000	\N	53000.00	PAID	2026-08-17 14:15:59.285
30	33	CASH	105000.000000000000000000000000000000	\N	\N	105000.00	PAID	2026-08-20 12:48:45.437
31	34	BANKING	\N	65000.000000000000000000000000000000	\N	65000.00	PAID	2026-08-20 12:51:03.458
32	35	CASH	50000.000000000000000000000000000000	\N	\N	50000.00	PAID	2026-08-20 12:51:23.961
33	36	CASH	50000.000000000000000000000000000000	\N	\N	50000.00	PAID	2026-08-20 13:20:47.874
34	40	CASH	612000.000000000000000000000000000000	\N	\N	612000.00	PAID	2026-08-20 13:57:01.857
35	43	CASH	115000.000000000000000000000000000000	\N	\N	115000.00	PAID	2026-08-20 14:06:10.144
36	44	CASH	113000.000000000000000000000000000000	\N	\N	113000.00	PAID	2026-08-20 14:08:27.387
38	45	CASH	609000.000000000000000000000000000000	\N	\N	609000.00	PAID	2026-08-20 15:14:44.565
39	46	CASH	50000.000000000000000000000000000000	\N	\N	50000.00	PAID	2026-08-20 15:14:51.395
40	47	BANKING	\N	221000.000000000000000000000000000000	\N	221000.00	PAID	2026-08-20 15:20:44.32
41	48	CASH	50000.000000000000000000000000000000	\N	\N	50000.00	PAID	2026-08-20 15:23:07.206
42	49	BANKING	\N	75000.000000000000000000000000000000	\N	75000.00	PAID	2026-08-20 15:23:17.981
43	50	CASH	35000.000000000000000000000000000000	\N	\N	35000.00	PAID	2026-08-21 03:49:21.679
44	51	CASH	115000.000000000000000000000000000000	\N	\N	115000.00	PAID	2026-08-21 12:28:13.277
45	52	CASH	105000.000000000000000000000000000000	\N	\N	105000.00	PAID	2026-08-21 12:56:25.429
46	53	BANKING	\N	208000.000000000000000000000000000000	\N	208000.00	PAID	2026-08-23 05:11:24.582
47	54	BANKING	\N	76000.000000000000000000000000000000	\N	76000.00	PAID	2026-08-23 05:16:36.971
48	55	CASH	130000.000000000000000000000000000000	\N	\N	130000.00	PAID	2026-08-23 05:18:29.103
49	56	BANKING	\N	35000.000000000000000000000000000000	\N	35000.00	PAID	2026-08-23 05:32:07.415
50	59	BANKING	\N	18000.000000000000000000000000000000	\N	18000.00	PAID	2026-08-23 06:06:42.753
51	58	CASH	148000.000000000000000000000000000000	\N	\N	148000.00	PAID	2026-08-23 06:06:50.887
52	57	CASH	55000.000000000000000000000000000000	\N	\N	55000.00	PAID	2026-08-23 06:09:40.023
53	60	BANKING	\N	60000.000000000000000000000000000000	\N	60000.00	PAID	2026-08-23 08:43:04.47
54	61	CASH	75000.000000000000000000000000000000	\N	\N	75000.00	PAID	2026-08-23 08:50:28.985
55	63	BANKING	\N	55000.000000000000000000000000000000	\N	55000.00	PAID	2026-08-23 09:21:36.608
56	62	CASH	120000.000000000000000000000000000000	\N	\N	120000.00	PAID	2026-08-23 09:21:45.626
57	66	CASH	50000.000000000000000000000000000000	\N	\N	50000.00	PAID	2026-08-23 09:38:53.317
58	65	CASH	55000.000000000000000000000000000000	\N	\N	55000.00	PAID	2026-08-23 09:38:59.114
59	68	CASH	180000.000000000000000000000000000000	\N	\N	180000.00	PAID	2026-08-23 10:42:22.858
60	67	CASH	90000.000000000000000000000000000000	\N	\N	90000.00	PAID	2026-08-23 10:42:30.919
61	69	CASH	50000.000000000000000000000000000000	\N	\N	50000.00	PAID	2026-08-23 14:21:45.678
62	70	BANKING	\N	75000.000000000000000000000000000000	\N	75000.00	PAID	2026-08-23 14:57:10.194
63	71	CASH	55000.000000000000000000000000000000	\N	\N	55000.00	PAID	2026-08-23 14:57:20.306
64	73	CASH	354000.000000000000000000000000000000	\N	\N	354000.00	PAID	2026-08-23 15:08:12.062
65	72	CASH	542000.000000000000000000000000000000	\N	\N	542000.00	PAID	2026-08-23 15:19:11.135
66	74	CASH	115000.000000000000000000000000000000	\N	\N	115000.00	PAID	2026-08-23 15:29:44.916
67	75	CASH	148000.000000000000000000000000000000	\N	\N	148000.00	PAID	2026-08-23 15:36:34.568
68	76	CASH	173000.000000000000000000000000000000	\N	\N	173000.00	PAID	2026-08-24 03:46:50.583
69	77	CASH	35000.000000000000000000000000000000	\N	\N	35000.00	PAID	2026-08-24 03:50:25.652
70	78	CASH	35000.000000000000000000000000000000	\N	\N	35000.00	PAID	2026-08-24 05:01:55.717
71	79	BANKING	\N	58000.000000000000000000000000000000	\N	58000.00	PAID	2026-08-24 07:47:31.403
72	80	CASH	55000.000000000000000000000000000000	\N	\N	55000.00	PAID	2026-08-25 09:22:14.795
73	81	CASH	75000.000000000000000000000000000000	\N	\N	75000.00	PAID	2026-08-25 09:22:26.183
74	83	CASH	75000.000000000000000000000000000000	\N	\N	75000.00	PAID	2026-08-25 09:25:56.334
75	82	CASH	58000.000000000000000000000000000000	\N	\N	58000.00	PAID	2026-08-25 09:26:02.767
76	84	CASH	60000.000000000000000000000000000000	\N	\N	60000.00	PAID	2026-09-03 03:35:42.193
77	85	CASH	60000.000000000000000000000000000000	\N	\N	60000.00	PAID	2026-09-03 07:55:04.626
78	86	CASH	60000.000000000000000000000000000000	\N	\N	60000.00	PAID	2026-09-03 08:03:30.04
79	87	CASH	50000.000000000000000000000000000000	\N	\N	50000.00	PAID	2026-09-03 08:07:57.087
80	88	CASH	93000.000000000000000000000000000000	\N	\N	93000.00	PAID	2026-09-03 08:47:09.149
81	89	CASH	50000.000000000000000000000000000000	\N	\N	50000.00	PAID	2026-09-03 08:52:41.103
82	90	CASH	75000.000000000000000000000000000000	\N	\N	75000.00	PAID	2026-09-03 08:54:12.277
83	91	CASH	359000.000000000000000000000000000000	\N	\N	359000.00	PAID	2026-09-03 08:55:45.131
84	92	CASH	65000.000000000000000000000000000000	\N	\N	65000.00	PAID	2026-09-03 08:57:40.56
85	93	CASH	50000.000000000000000000000000000000	\N	\N	50000.00	PAID	2026-09-03 09:01:38.241
86	95	CASH	60000.000000000000000000000000000000	\N	\N	60000.00	PAID	2026-09-07 14:36:02.119
87	94	BANKING	\N	50000.000000000000000000000000000000	\N	50000.00	PAID	2026-09-07 14:36:14.232
88	96	BANKING	\N	133000.000000000000000000000000000000	\N	133000.00	PAID	2026-09-07 14:36:20.325
89	100	BANKING	\N	60000.000000000000000000000000000000	\N	60000.00	PAID	2026-09-07 15:19:15.824
90	97	CASH	55000.000000000000000000000000000000	\N	\N	55000.00	PAID	2026-09-08 01:48:29.634
91	99	CASH	75000.000000000000000000000000000000	\N	\N	75000.00	PAID	2026-09-08 01:48:37.117
92	98	CASH	30000.000000000000000000000000000000	\N	\N	30000.00	PAID	2026-09-08 01:48:42.733
93	102	BANKING	\N	65000.000000000000000000000000000000	\N	65000.00	PAID	2026-09-08 01:48:49.471
94	101	CASH	65000.000000000000000000000000000000	\N	\N	65000.00	PAID	2026-09-08 01:48:58.392
95	104	CASH	18000.000000000000000000000000000000	\N	\N	18000.00	PAID	2026-09-08 01:49:05.138
96	103	CASH	324000.000000000000000000000000000000	\N	\N	324000.00	PAID	2026-09-08 01:49:13.572
97	105	CASH	60000.000000000000000000000000000000	\N	\N	60000.00	PAID	2026-09-08 01:49:52.727
98	106	CASH	60000.000000000000000000000000000000	\N	\N	60000.00	PAID	2026-09-08 02:06:00.223
99	107	CASH	50000.000000000000000000000000000000	\N	\N	50000.00	PAID	2026-09-08 02:09:39.993
100	108	CASH	83000.000000000000000000000000000000	\N	\N	83000.00	PAID	2026-09-08 02:27:27.124
101	111	BANKING	\N	60000.000000000000000000000000000000	\N	60000.00	PAID	2026-09-08 02:44:07.366
102	112	CASH	58000.000000000000000000000000000000	\N	\N	58000.00	PAID	2026-09-08 04:01:39.617
103	110	BANKING	\N	50000.000000000000000000000000000000	\N	50000.00	PAID	2026-09-08 04:31:53.981
104	109	CASH	50000.000000000000000000000000000000	\N	\N	50000.00	PAID	2026-09-08 04:32:00.017
105	116	CASH	50000.000000000000000000000000000000	\N	\N	50000.00	PAID	2026-09-10 02:51:31.466
106	123	CASH	238000.000000000000000000000000000000	\N	\N	238000.00	PAID	2026-09-15 09:43:03.442
107	124	CASH	50000.000000000000000000000000000000	\N	\N	50000.00	PAID	2026-09-15 09:50:10.394
108	125	CASH	50000.000000000000000000000000000000	\N	\N	50000.00	PAID	2026-09-15 09:50:24.375
109	126	CASH	50000.000000000000000000000000000000	\N	\N	50000.00	PAID	2026-09-15 09:50:51.74
110	127	CASH	75000.000000000000000000000000000000	\N	\N	75000.00	PAID	2026-09-15 09:59:04.438
111	128	CASH	18000.000000000000000000000000000000	\N	\N	18000.00	PAID	2026-09-15 10:02:39.611
112	129	CASH	55000.000000000000000000000000000000	\N	\N	55000.00	PAID	2026-09-15 11:19:02.143
113	130	CASH	35000.000000000000000000000000000000	\N	\N	35000.00	PAID	2026-09-15 11:26:55.378
114	133	CASH	35000.000000000000000000000000000000	\N	\N	35000.00	PAID	2026-09-15 13:17:10.963
115	137	BANKING	\N	18000.000000000000000000000000000000	\N	18000.00	PAID	2026-09-15 13:31:52.554
116	132	BANKING	\N	55000.000000000000000000000000000000	\N	55000.00	PAID	2026-09-15 13:32:03.13
117	139	CASH	55000.000000000000000000000000000000	\N	\N	55000.00	PAID	2026-09-16 03:39:41.028
118	142	CASH	30000.000000000000000000000000000000	\N	\N	30000.00	PAID	2026-09-16 03:53:04.322
119	141	CASH	35000.000000000000000000000000000000	\N	\N	35000.00	PAID	2026-09-16 09:45:21.842
120	140	BANKING	\N	58000.000000000000000000000000000000	\N	58000.00	PAID	2026-09-16 09:48:46.749
121	143	CASH	60000.000000000000000000000000000000	\N	\N	60000.00	PAID	2026-09-16 09:49:05.598
122	145	CASH	35000.000000000000000000000000000000	\N	\N	35000.00	PAID	2026-09-16 09:54:49.978
123	147	CASH	50000.000000000000000000000000000000	\N	\N	50000.00	PAID	2026-09-16 12:37:46.721
124	146	BANKING	\N	35000.000000000000000000000000000000	\N	35000.00	PAID	2026-09-16 12:46:56.873
125	148	CASH	35000.000000000000000000000000000000	\N	\N	35000.00	PAID	2026-09-16 12:47:07.36
126	150	CASH	60000.000000000000000000000000000000	\N	\N	60000.00	PAID	2026-09-16 14:16:43.721
127	152	CASH	80000.000000000000000000000000000000	\N	\N	80000.00	PAID	2026-09-17 13:17:37.46
128	153	CASH	60000.000000000000000000000000000000	\N	\N	60000.00	PAID	2026-09-18 02:04:38.934
129	154	CASH	55000.000000000000000000000000000000	\N	\N	55000.00	PAID	2026-09-18 02:17:02.776
130	155	CASH	110000.000000000000000000000000000000	\N	\N	110000.00	PAID	2026-09-18 02:46:30.553
131	156	CASH	110000.000000000000000000000000000000	\N	\N	110000.00	PAID	2026-09-18 02:54:36.023
132	157	CASH	50000.000000000000000000000000000000	\N	\N	50000.00	PAID	2026-09-18 03:16:18.597
133	158	CASH	60000.000000000000000000000000000000	\N	\N	60000.00	PAID	2026-09-18 03:20:29.08
134	159	CASH	30000.000000000000000000000000000000	\N	\N	30000.00	PAID	2026-09-18 03:24:37.402
135	160	CASH	58000.000000000000000000000000000000	\N	\N	58000.00	PAID	2026-09-18 03:25:03.039
136	172	CASH	60000.000000000000000000000000000000	\N	\N	60000.00	PAID	2026-09-19 06:27:37.448
137	174	BANKING	\N	120000.000000000000000000000000000000	\N	120000.00	PAID	2026-09-19 13:51:02.476
138	175	CASH	225000.000000000000000000000000000000	\N	\N	225000.00	PAID	2026-09-19 14:14:14.777
139	176	CASH	100000.000000000000000000000000000000	\N	\N	100000.00	PAID	2026-09-19 14:17:50.422
140	177	CASH	30000.000000000000000000000000000000	\N	\N	30000.00	PAID	2026-09-19 14:17:57.359
141	180	BANKING	\N	50000.000000000000000000000000000000	\N	50000.00	PAID	2026-09-19 14:20:39.865
142	149	CASH	35000.000000000000000000000000000000	\N	\N	35000.00	PAID	2026-09-20 02:45:11.353
143	212	BANKING	\N	60000.000000000000000000000000000000	\N	60000.00	PAID	2026-09-20 02:58:33.388
144	210	CASH	319000.000000000000000000000000000000	\N	\N	319000.00	PAID	2026-09-20 02:59:02.264
145	214	CASH	50000.000000000000000000000000000000	\N	\N	50000.00	PAID	2026-09-20 02:59:38.28
146	217	CASH	100000.000000000000000000000000000000	\N	\N	100000.00	PAID	2026-09-20 09:09:24.708
147	222	BANKING	\N	110000.000000000000000000000000000000	\N	110000.00	PAID	2026-09-20 10:26:07.608
148	223	CASH	30000.000000000000000000000000000000	\N	\N	30000.00	PAID	2026-09-22 13:56:05.118
149	224	CASH	30000.000000000000000000000000000000	\N	\N	30000.00	PAID	2026-09-22 14:02:42.712
150	227	BANKING	\N	55000.000000000000000000000000000000	\N	55000.00	PAID	2026-09-22 14:03:34.332
151	226	CASH	18000.000000000000000000000000000000	\N	\N	18000.00	PAID	2026-09-22 14:05:05.201
152	225	CASH	35000.000000000000000000000000000000	\N	\N	35000.00	PAID	2026-09-22 14:05:16.38
153	228	CASH	58000.000000000000000000000000000000	\N	\N	58000.00	PAID	2026-09-22 14:05:26.717
154	229	CASH	60000.000000000000000000000000000000	\N	\N	60000.00	PAID	2026-09-22 14:23:21.329
155	231	CASH	35000.000000000000000000000000000000	\N	\N	35000.00	PAID	2026-09-22 14:48:10.471
156	232	CASH	35000.000000000000000000000000000000	\N	\N	35000.00	PAID	2026-09-22 14:48:16.057
\.


--
-- Data for Name: reservation_tables; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reservation_tables (reservation_id, table_id) FROM stdin;
1	15
\.


--
-- Data for Name: reservations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reservations (id, customer_name, customer_phone, number_of_guests, reservation_time, status, note, created_at, updated_at, restaurant_id, branch_id, cancelled_at, checked_in_at, completed_at, created_by_id, duration_minutes, no_show_at, reminder_called_at) FROM stdin;
1	Minh	0987345267	2	2026-09-19 02:00:00	NO_SHOW	\N	2026-09-18 02:32:57.447	2026-09-19 05:19:06.034	1	1	\N	\N	\N	2	90	2026-09-19 05:19:05.548	\N
\.


--
-- Data for Name: restaurants; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.restaurants (id, name, logo, admin_id, created_at, updated_at, mode) FROM stdin;
1	Quán Nhỏ	/uploads/restaurants/1787220247542-728806560.png	1	2026-07-28 14:31:38.322	2026-09-14 09:27:37.979	MULTI
2	Tre	/uploads/restaurants/1787220247542-728806560.png	2	2026-07-28 14:31:38.322	2026-09-14 09:27:37.979	SINGLE
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roles (id, name) FROM stdin;
1	ADMIN
3	ORDER
2	BRANCH
4	CASHIER
5	KITCHEN
\.


--
-- Data for Name: service_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.service_requests (id, branch_id, table_id, customer_id, message, status, handled_by_id, handled_at, created_at, updated_at) FROM stdin;
1	1	3	\N	Thêm rau ăn kèm	COMPLETED	2	2026-08-23 08:29:31.689	2026-08-23 08:17:42.868	2026-08-23 08:29:40.133
2	1	2	\N	nước	COMPLETED	2	2026-08-23 08:29:33.134	2026-08-23 08:24:02.402	2026-08-23 08:29:40.934
3	1	1	\N	nước	COMPLETED	2	2026-08-23 08:29:34.321	2026-08-23 08:24:38.949	2026-08-23 08:29:46.904
4	1	3	\N	rau ăn kèm	COMPLETED	2	2026-08-23 08:30:09.107	2026-08-23 08:30:02.854	2026-08-23 08:30:10.066
5	1	3	\N	thêm rau thơm	COMPLETED	2	2026-08-23 08:37:01.97	2026-08-23 08:36:43.237	2026-08-23 08:42:40.474
6	3	27	\N	nước	COMPLETED	3	2026-08-23 13:26:40.859	2026-08-23 13:22:10.469	2026-08-23 13:26:42.25
7	3	27	100	nước	COMPLETED	3	2026-08-23 14:19:32.195	2026-08-23 13:26:45.202	2026-08-23 14:19:33.347
8	3	27	100	thêm rau sống	ACCEPTED	3	2026-08-23 14:19:50.101	2026-08-23 14:19:39.598	2026-08-23 14:19:50.103
9	1	1	106	thêm nước chấm	COMPLETED	2	2026-08-24 02:46:08.048	2026-08-24 02:40:48.906	2026-08-24 07:48:28.418
10	1	5	8	nước	COMPLETED	2	2026-08-25 09:26:06.464	2026-08-25 09:24:44.143	2026-08-25 09:26:07.164
11	1	3	80	nước	COMPLETED	8	2026-09-15 13:35:32.317	2026-09-15 13:35:26.491	2026-09-15 13:35:34.034
12	1	3	80	thêm rau	COMPLETED	8	2026-09-20 03:29:41.511	2026-09-20 03:29:27.647	2026-09-20 03:31:43.789
13	1	3	80	thêm rau	COMPLETED	8	2026-09-20 09:33:59.937	2026-09-20 09:25:24.275	2026-09-20 09:34:01.708
14	1	3	80	a	COMPLETED	8	2026-09-20 10:04:37.912	2026-09-20 09:44:48.023	2026-09-20 10:04:41.757
\.


--
-- Data for Name: tables; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tables (id, floor_id, table_number, qr_code, status, created_at, capacity) FROM stdin;
27	4	1	c14302ca-81c6-4090-a074-60f5ef4d21ce	AVAILABLE	2026-08-10 04:27:28.466	4
32	6	1	002306d9-dfbd-4805-8f07-8bf47205e806	AVAILABLE	2026-08-24 07:41:49.911	4
5	1	5	Q1-T1-B5	AVAILABLE	2026-07-28 14:31:38.52	4
4	1	4	Q1-T1-B4	AVAILABLE	2026-07-28 14:31:38.49	4
1	1	10	Q1-T1-B1	AVAILABLE	2026-07-28 14:31:38.471	4
3	1	3	Q1-T1-B3	AVAILABLE	2026-07-28 14:31:38.486	1
8	1	8	Q1-T1-B8	AVAILABLE	2026-07-28 14:31:38.533	4
9	1	9	Q1-T1-B9	AVAILABLE	2026-07-28 14:31:38.536	6
13	2	12	Q1-T2-B13	AVAILABLE	2026-07-28 14:31:38.551	8
11	2	10	Q1-T2-B11	AVAILABLE	2026-07-28 14:31:38.544	4
12	2	11	Q1-T2-B12	AVAILABLE	2026-07-28 14:31:38.547	4
14	2	13	Q1-T2-B14	AVAILABLE	2026-07-28 14:31:38.554	4
30	4	10	89452dae-6802-465e-b340-3cbf51596e5e	AVAILABLE	2026-08-10 04:27:48.285	4
31	5	12	e676478e-a53e-4040-b381-67a5638c8e91	AVAILABLE	2026-08-10 04:27:55.533	4
6	1	6	Q1-T1-B6	AVAILABLE	2026-07-28 14:31:38.525	5
28	4	2	6dd23390-f4fb-4509-93bf-1b75cd9ea338	AVAILABLE	2026-08-10 04:27:32.137	4
7	1	1	Q1-T1-B7	AVAILABLE	2026-07-28 14:31:38.53	6
15	2	14	Q1-T2-B15	AVAILABLE	2026-07-28 14:31:38.557	8
29	4	3	19c1205a-0381-464f-92e2-23f836a4afa6	AVAILABLE	2026-08-10 04:27:35.022	4
2	1	2	Q1-T1-B2	AVAILABLE	2026-07-28 14:31:38.481	6
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, password, email, "isActive", "mustChangePassword", role_id, branch_id, created_at, updated_at, restaurant_id) FROM stdin;
7	Trang	$2b$10$74SHU1Hs676CLzw6tfoOdODyqGCc87Ebrg.oqLlpeWZa72/cecxsK	quynh2112trang@gmail.com	t	t	5	1	2026-08-24 08:53:57.039	2026-09-08 04:49:38.677	1
2	Hoàng Mai	$2b$10$ZquYkmxIKkJDBVIrMgeKI.a9eN8fJUN7XhIc9BWzbbyNed6jnM9ou	thanhhha1306@gmail.com	t	f	2	1	2026-07-28 14:31:38.322	2026-09-06 06:27:32.26	1
10	Hoàn Kiếm	$2b$10$/q9GVJ5T9UvmQZbfmec.UOAv6BMhq3wPUTIv6qoOhnVv3ZG8Kh5FS	streamnhacan1@gmail.com	t	t	2	5	2026-09-16 13:25:15.726	2026-09-16 13:25:15.726	1
3	admin2	$2b$10$O0tTN/G2ZjuEYFTTAbc5RuQWh0U4GwBZLHc/0lnCw9qV9CzLx9ZS6	thaopnguyen162@gmail.com	t	f	1	\N	2026-08-10 04:24:03.173	2026-09-20 02:39:22.578	2
6	hieutminh99@gmail.com	$2b$10$8GFiWqlYpTzvvrgo0YOCEu4Lil9EqzAM9wRcKbg5V7GzTPir23Zku	hieutminh99@gmail.com	t	f	2	4	2026-08-24 07:41:17.382	2026-09-20 02:41:31.785	1
9	My	$2b$10$OcXRw9.ut.vcQ/KbAKWHeuQMcGyfJI4MGssZosgSczEDs1QgfFUEO	akaruitsuki1602@gmail.com	t	t	4	4	2026-09-16 12:26:56.718	2026-09-20 02:41:43.511	2
1	admin	$2b$10$160tfBTuJBUoAhNBsUVNIuWyizGKS/DmQrDqOlubN4s12BJCpJHJa	mieumieu1k99@gmail.com	t	f	1	\N	2026-07-28 14:31:38.309	2026-08-21 12:40:45.8	1
8	Phương Thảo	$2b$10$KtgznalxuSVvXncVmLn26eZADK6HWelQ1vWYu9qoJr5vDJ1HTyiUe	nguyenpthao266@gmail.com	t	t	4	1	2026-09-03 04:57:58.444	2026-09-08 02:30:58.503	1
5	Tuyết Mai	$2b$10$MqH7S4SeO5pdhWfgBC/DHOMSyVl6UmGfw9OH1oyPswlWFrdDK61ze	akaruitsuki2606@gmail.com	t	t	3	3	2026-08-21 12:52:26.461	2026-08-21 12:53:03.823	1
4	Minh	$2b$10$Q5hBPl.mhvxJbGOScZUGT.4C7K9WJimyi2bY1CIVWL0odPlgbT27W	thanhhha216@gmail.com	t	f	3	1	2026-08-21 10:53:37.901	2026-09-03 08:52:05.36	1
\.


--
-- Name: branch_foods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.branch_foods_id_seq', 161, true);


--
-- Name: branches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.branches_id_seq', 5, true);


--
-- Name: cart_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cart_items_id_seq', 11, true);


--
-- Name: carts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.carts_id_seq', 32, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.categories_id_seq', 8, true);


--
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.customers_id_seq', 230, true);


--
-- Name: dining_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.dining_sessions_id_seq', 121, true);


--
-- Name: email_change_otps_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.email_change_otps_id_seq', 2, true);


--
-- Name: floors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.floors_id_seq', 9, true);


--
-- Name: foods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.foods_id_seq', 22, true);


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.order_items_id_seq', 331, true);


--
-- Name: order_members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.order_members_id_seq', 211, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.orders_id_seq', 232, true);


--
-- Name: password_reset_otps_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.password_reset_otps_id_seq', 14, true);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.payments_id_seq', 156, true);


--
-- Name: reservations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reservations_id_seq', 1, true);


--
-- Name: restaurants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.restaurants_id_seq', 1, false);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.roles_id_seq', 3, true);


--
-- Name: service_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.service_requests_id_seq', 14, true);


--
-- Name: tables_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tables_id_seq', 36, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 10, true);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: branch_foods branch_foods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branch_foods
    ADD CONSTRAINT branch_foods_pkey PRIMARY KEY (id);


--
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (id);


--
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- Name: carts carts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: dining_sessions dining_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dining_sessions
    ADD CONSTRAINT dining_sessions_pkey PRIMARY KEY (id);


--
-- Name: email_change_otps email_change_otps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_change_otps
    ADD CONSTRAINT email_change_otps_pkey PRIMARY KEY (id);


--
-- Name: floors floors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.floors
    ADD CONSTRAINT floors_pkey PRIMARY KEY (id);


--
-- Name: foods foods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.foods
    ADD CONSTRAINT foods_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: order_members order_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_members
    ADD CONSTRAINT order_members_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: password_reset_otps password_reset_otps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_otps
    ADD CONSTRAINT password_reset_otps_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: reservation_tables reservation_tables_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservation_tables
    ADD CONSTRAINT reservation_tables_pkey PRIMARY KEY (reservation_id, table_id);


--
-- Name: reservations reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_pkey PRIMARY KEY (id);


--
-- Name: restaurants restaurants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.restaurants
    ADD CONSTRAINT restaurants_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: service_requests service_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_requests
    ADD CONSTRAINT service_requests_pkey PRIMARY KEY (id);


--
-- Name: tables tables_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tables
    ADD CONSTRAINT tables_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: branch_foods_branch_id_food_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX branch_foods_branch_id_food_id_key ON public.branch_foods USING btree (branch_id, food_id);


--
-- Name: branches_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX branches_email_key ON public.branches USING btree (email);


--
-- Name: cart_items_cartId_foodId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "cart_items_cartId_foodId_key" ON public.cart_items USING btree ("cartId", "foodId");


--
-- Name: carts_customerId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "carts_customerId_key" ON public.carts USING btree ("customerId");


--
-- Name: categories_restaurant_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX categories_restaurant_id_idx ON public.categories USING btree (restaurant_id);


--
-- Name: categories_restaurant_id_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX categories_restaurant_id_name_key ON public.categories USING btree (restaurant_id, name);


--
-- Name: customers_guest_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX customers_guest_token_key ON public.customers USING btree (guest_token);


--
-- Name: customers_restaurant_id_device_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX customers_restaurant_id_device_id_idx ON public.customers USING btree (restaurant_id, device_id);


--
-- Name: customers_restaurant_id_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX customers_restaurant_id_email_key ON public.customers USING btree (restaurant_id, email);


--
-- Name: customers_restaurant_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX customers_restaurant_id_idx ON public.customers USING btree (restaurant_id);


--
-- Name: customers_restaurant_id_phone_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX customers_restaurant_id_phone_key ON public.customers USING btree (restaurant_id, phone);


--
-- Name: dining_sessions_reservation_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX dining_sessions_reservation_id_idx ON public.dining_sessions USING btree (reservation_id);


--
-- Name: email_change_otps_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX email_change_otps_user_id_idx ON public.email_change_otps USING btree (user_id);


--
-- Name: floors_branch_id_floor_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX floors_branch_id_floor_number_key ON public.floors USING btree (branch_id, floor_number);


--
-- Name: foods_restaurant_id_category_id_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX foods_restaurant_id_category_id_name_key ON public.foods USING btree (restaurant_id, category_id, name);


--
-- Name: foods_restaurant_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX foods_restaurant_id_idx ON public.foods USING btree (restaurant_id);


--
-- Name: order_items_order_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX order_items_order_id_idx ON public.order_items USING btree (order_id);


--
-- Name: order_items_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX order_items_status_idx ON public.order_items USING btree (status);


--
-- Name: order_members_customer_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX order_members_customer_id_idx ON public.order_members USING btree (customer_id);


--
-- Name: order_members_customer_id_order_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX order_members_customer_id_order_id_key ON public.order_members USING btree (customer_id, order_id);


--
-- Name: order_members_order_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX order_members_order_id_idx ON public.order_members USING btree (order_id);


--
-- Name: orders_branch_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_branch_id_idx ON public.orders USING btree (branch_id);


--
-- Name: orders_created_by_customer_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_created_by_customer_id_idx ON public.orders USING btree (created_by_customer_id);


--
-- Name: orders_created_by_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_created_by_user_id_idx ON public.orders USING btree (created_by_user_id);


--
-- Name: orders_order_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX orders_order_code_key ON public.orders USING btree (order_code);


--
-- Name: orders_session_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_session_id_idx ON public.orders USING btree (session_id);


--
-- Name: orders_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_status_idx ON public.orders USING btree (status);


--
-- Name: payments_order_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX payments_order_id_key ON public.payments USING btree (order_id);


--
-- Name: reservation_tables_table_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reservation_tables_table_id_idx ON public.reservation_tables USING btree (table_id);


--
-- Name: reservations_branch_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reservations_branch_id_idx ON public.reservations USING btree (branch_id);


--
-- Name: reservations_created_by_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reservations_created_by_id_idx ON public.reservations USING btree (created_by_id);


--
-- Name: reservations_reservation_time_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reservations_reservation_time_idx ON public.reservations USING btree (reservation_time);


--
-- Name: reservations_restaurant_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reservations_restaurant_id_idx ON public.reservations USING btree (restaurant_id);


--
-- Name: reservations_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reservations_status_idx ON public.reservations USING btree (status);


--
-- Name: restaurants_admin_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX restaurants_admin_id_key ON public.restaurants USING btree (admin_id);


--
-- Name: roles_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX roles_name_key ON public.roles USING btree (name);


--
-- Name: service_requests_branch_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX service_requests_branch_id_idx ON public.service_requests USING btree (branch_id);


--
-- Name: service_requests_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX service_requests_created_at_idx ON public.service_requests USING btree (created_at);


--
-- Name: service_requests_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX service_requests_status_idx ON public.service_requests USING btree (status);


--
-- Name: service_requests_table_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX service_requests_table_id_idx ON public.service_requests USING btree (table_id);


--
-- Name: tables_floor_id_table_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX tables_floor_id_table_number_key ON public.tables USING btree (floor_id, table_number);


--
-- Name: tables_qr_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX tables_qr_code_key ON public.tables USING btree (qr_code);


--
-- Name: users_branch_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_branch_id_idx ON public.users USING btree (branch_id);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_restaurant_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_restaurant_id_idx ON public.users USING btree (restaurant_id);


--
-- Name: users_username_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);


--
-- Name: branch_foods branch_foods_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branch_foods
    ADD CONSTRAINT branch_foods_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: branch_foods branch_foods_food_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branch_foods
    ADD CONSTRAINT branch_foods_food_id_fkey FOREIGN KEY (food_id) REFERENCES public.foods(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: branches branches_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: cart_items cart_items_cartId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT "cart_items_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES public.carts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: cart_items cart_items_foodId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT "cart_items_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES public.foods(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: carts carts_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT "carts_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: categories categories_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: customers customers_currentOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT "customers_currentOrderId_fkey" FOREIGN KEY ("currentOrderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: customers customers_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: customers customers_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.dining_sessions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: customers customers_table_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: dining_sessions dining_sessions_ended_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dining_sessions
    ADD CONSTRAINT dining_sessions_ended_by_fkey FOREIGN KEY (ended_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: dining_sessions dining_sessions_reservation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dining_sessions
    ADD CONSTRAINT dining_sessions_reservation_id_fkey FOREIGN KEY (reservation_id) REFERENCES public.reservations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: dining_sessions dining_sessions_table_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dining_sessions
    ADD CONSTRAINT dining_sessions_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: email_change_otps email_change_otps_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_change_otps
    ADD CONSTRAINT email_change_otps_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: floors floors_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.floors
    ADD CONSTRAINT floors_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: foods foods_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.foods
    ADD CONSTRAINT foods_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: foods foods_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.foods
    ADD CONSTRAINT foods_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_items order_items_food_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_food_id_fkey FOREIGN KEY (food_id) REFERENCES public.foods(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_members order_members_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_members
    ADD CONSTRAINT order_members_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_members order_members_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_members
    ADD CONSTRAINT order_members_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: orders orders_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: orders orders_created_by_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_created_by_customer_id_fkey FOREIGN KEY (created_by_customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: orders orders_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: orders orders_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.dining_sessions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: payments payments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservation_tables reservation_tables_reservation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservation_tables
    ADD CONSTRAINT reservation_tables_reservation_id_fkey FOREIGN KEY (reservation_id) REFERENCES public.reservations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservation_tables reservation_tables_table_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservation_tables
    ADD CONSTRAINT reservation_tables_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservations reservations_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservations reservations_created_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_created_by_id_fkey FOREIGN KEY (created_by_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: reservations reservations_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: restaurants restaurants_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.restaurants
    ADD CONSTRAINT restaurants_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: service_requests service_requests_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_requests
    ADD CONSTRAINT service_requests_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: service_requests service_requests_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_requests
    ADD CONSTRAINT service_requests_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: service_requests service_requests_handled_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_requests
    ADD CONSTRAINT service_requests_handled_by_id_fkey FOREIGN KEY (handled_by_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: service_requests service_requests_table_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_requests
    ADD CONSTRAINT service_requests_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tables tables_floor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tables
    ADD CONSTRAINT tables_floor_id_fkey FOREIGN KEY (floor_id) REFERENCES public.floors(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: users users_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict RRkakAELHrWfeAvS8c1WFE8DrA6hh0IXDfALIchK3Ht9rnOichfXYu28WplUvAw

