%% @author Couchbase <info@couchbase.com>
%% @copyright 2020 Couchbase, Inc.
%%
%% Licensed under the Apache License, Version 2.0 (the "License");
%% you may not use this file except in compliance with the License.
%% You may obtain a copy of the License at
%%
%%      http://www.apache.org/licenses/LICENSE-2.0
%%
%% Unless required by applicable law or agreed to in writing, software
%% distributed under the License is distributed on an "AS IS" BASIS,
%% WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
%% See the License for the specific language governing permissions and
%% limitations under the License.
-module(menelaus_web_prometheus).

%% API
-export([handle_get_metrics/1, handle_create_snapshot/1]).

-include("ns_common.hrl").

%%%===================================================================
%%% API
%%%===================================================================

handle_get_metrics(Req) ->
    RespTuple = {200, [], chunked},
    Resp = mochiweb_request:respond(RespTuple, Req),
    ns_server_stats:report_prom_stats(fun (M) -> report_metric(M, Resp) end),
    mochiweb_response:write_chunk(<<>>, Resp).

handle_create_snapshot(Req) ->
    menelaus_util:ensure_local(Req),
    Settings = prometheus_cfg:settings(),
    case prometheus:create_snapshot(5000, Settings) of
        {ok, Response} ->
            menelaus_util:reply_text(Req, Response, 200);
        {error, Reason} ->
            menelaus_util:reply_text(Req, Reason, 500)
    end.

%%%===================================================================
%%% Internal functions
%%%===================================================================

report_metric({Metric, Labels, Value}, Resp) ->
    Line =
        [name_to_iolist(Metric), <<"{">>,
         lists:join(<<",">>,[[K, <<"=\"">>, V, <<"\"">>] || {K, V} <- Labels]),
         <<"} ">>, prometheus:format_value(Value), <<"\n">>],
    mochiweb_response:write_chunk(Line, Resp);
report_metric({Prefix, Metric, Labels, Value}, Resp) ->
    Prefixed = [Prefix, <<"_">>, name_to_iolist(Metric)],
    report_metric({Prefixed, Labels, Value}, Resp).

name_to_iolist(A) when is_atom(A) -> atom_to_binary(A, latin1);
name_to_iolist(A) -> A.
