PGDMP  5                    |           TeamLink    16.4    16.4                0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false                       0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false                       0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            	           1262    16398    TeamLink    DATABASE     �   CREATE DATABASE "TeamLink" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_United States.1252';
    DROP DATABASE "TeamLink";
                postgres    false            �            1259    16414    boards    TABLE     $  CREATE TABLE public.boards (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    color character varying(7)
);
    DROP TABLE public.boards;
       public         heap    postgres    false            �            1259    16413    boards_id_seq    SEQUENCE     �   CREATE SEQUENCE public.boards_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public.boards_id_seq;
       public          postgres    false    216            
           0    0    boards_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public.boards_id_seq OWNED BY public.boards.id;
          public          postgres    false    215            �            1259    16425    lists    TABLE       CREATE TABLE public.lists (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    board_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "position" integer
);
    DROP TABLE public.lists;
       public         heap    postgres    false            �            1259    16424    lists_id_seq    SEQUENCE     �   CREATE SEQUENCE public.lists_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.lists_id_seq;
       public          postgres    false    218                       0    0    lists_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.lists_id_seq OWNED BY public.lists.id;
          public          postgres    false    217            �            1259    16439    tasks    TABLE     �  CREATE TABLE public.tasks (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    status character varying(50) DEFAULT 'backlog'::character varying NOT NULL,
    priority character varying(50) DEFAULT 'medium'::character varying,
    list_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    due_date timestamp without time zone,
    completed_at timestamp without time zone,
    "position" integer,
    CONSTRAINT tasks_priority_check CHECK (((priority)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'very high'::character varying])::text[]))),
    CONSTRAINT tasks_status_check CHECK (((status)::text = ANY ((ARRAY['backlog'::character varying, 'TODO'::character varying, 'ongoing'::character varying, 'test'::character varying, 'done'::character varying])::text[])))
);
    DROP TABLE public.tasks;
       public         heap    postgres    false            �            1259    16438    tasks_id_seq    SEQUENCE     �   CREATE SEQUENCE public.tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.tasks_id_seq;
       public          postgres    false    220                       0    0    tasks_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.tasks_id_seq OWNED BY public.tasks.id;
          public          postgres    false    219            Z           2604    16417 	   boards id    DEFAULT     f   ALTER TABLE ONLY public.boards ALTER COLUMN id SET DEFAULT nextval('public.boards_id_seq'::regclass);
 8   ALTER TABLE public.boards ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    215    216    216            ]           2604    16428    lists id    DEFAULT     d   ALTER TABLE ONLY public.lists ALTER COLUMN id SET DEFAULT nextval('public.lists_id_seq'::regclass);
 7   ALTER TABLE public.lists ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    217    218    218            `           2604    16442    tasks id    DEFAULT     d   ALTER TABLE ONLY public.tasks ALTER COLUMN id SET DEFAULT nextval('public.tasks_id_seq'::regclass);
 7   ALTER TABLE public.tasks ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    219    220    220            �          0    16414    boards 
   TABLE DATA           V   COPY public.boards (id, name, description, created_at, updated_at, color) FROM stdin;
    public          postgres    false    216   �                  0    16425    lists 
   TABLE DATA           W   COPY public.lists (id, name, board_id, created_at, updated_at, "position") FROM stdin;
    public          postgres    false    218   �                  0    16439    tasks 
   TABLE DATA           �   COPY public.tasks (id, title, description, status, priority, list_id, created_at, updated_at, due_date, completed_at, "position") FROM stdin;
    public          postgres    false    220   �!                  0    0    boards_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.boards_id_seq', 60, true);
          public          postgres    false    215                       0    0    lists_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.lists_id_seq', 91, true);
          public          postgres    false    217                       0    0    tasks_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.tasks_id_seq', 167, true);
          public          postgres    false    219            h           2606    16423    boards boards_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.boards
    ADD CONSTRAINT boards_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.boards DROP CONSTRAINT boards_pkey;
       public            postgres    false    216            j           2606    16432    lists lists_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.lists
    ADD CONSTRAINT lists_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.lists DROP CONSTRAINT lists_pkey;
       public            postgres    false    218            l           2606    16451    tasks tasks_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.tasks DROP CONSTRAINT tasks_pkey;
       public            postgres    false    220            m           2606    16433    lists lists_board_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.lists
    ADD CONSTRAINT lists_board_id_fkey FOREIGN KEY (board_id) REFERENCES public.boards(id) ON DELETE CASCADE;
 C   ALTER TABLE ONLY public.lists DROP CONSTRAINT lists_board_id_fkey;
       public          postgres    false    4712    218    216            n           2606    16452    tasks tasks_list_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_list_id_fkey FOREIGN KEY (list_id) REFERENCES public.lists(id) ON DELETE CASCADE;
 B   ALTER TABLE ONLY public.tasks DROP CONSTRAINT tasks_list_id_fkey;
       public          postgres    false    4714    218    220            �   ]   x�3��qK���4202�5��50Q00�26�21�3�4723�'���h \f�)��yy�&Y�Z���[�R�00H3H����� G�t         �   x�}�=
1��:s
/�0Ifҩ+�i,���7PXP���	/��kZ���r$!�=ŞlG�,1b�<#��x8]o�2�x���j�xI����!��!�g����u�/pmb��F����5
���&�Q�0�Zf�^#��Τ�ė �3�b�$1#�'��Z�         �   x����N�0Eד������5iQ�T
)� U�h��� ә�7G>W�HKP��N���������u��`�~~�܁�@Hz�<A]�D��`��q5�YHk��lad>�N�l )�!�Y4��V7����j��#�G�T(%H�N��ռ���H��`@#�qL:�~��
��ܤ���������ov�Px�N�^��,b�P����Sb8�^z�Q�o4���ru� w�#�_V��:�~�(���r��     